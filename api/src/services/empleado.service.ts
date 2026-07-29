import { prisma } from "../config/prisma"
import {
    CreateEmpleadoDto,
    UpdateEmpleadoDto,
    UpdateEstadoEmpleadoDto,
} from "../dtos/empleado.dto"

/**
 * Estados que representan citas activas.
 *
 * Cancelada y Finalizada no bloquean la desactivación.
 */
const estadosQueBloquean = [
    "Pendiente",
    "Confirmada",
]

/**
 * Selección segura para datos del usuario.
 *
 * Nunca se retorna passwordHash.
 */
const usuarioSelect = {
    id: true,
    nombre: true,
    primerApellido: true,
    segundoApellido: true,
    correo: true,
    telefono: true,
    activo: true,
    rolId: true,
    creadoEn: true,
    actualizadoEn: true,
    rol: {
        select: {
            id: true,
            nombre: true,
            descripcion: true,
            activo: true,
        },
    },
} as const

/**
 * Valida las relaciones utilizadas al crear o modificar
 * un empleado.
 */
async function validarDatosEmpleado(
    data: {
        usuarioId: number
        especialidadId: number
        codigoEmpleado: string
        servicioIds: number[]
    },
    empleadoIdActual?: number
) {
    const usuario =
        await prisma.usuario.findUnique({
            where: {
                id: data.usuarioId,
            },
            select: {
                id: true,
                activo: true,
                empleado: {
                    select: {
                        id: true,
                    },
                },
            },
        })
    if (!usuario) {
        throw new Error(
            "El usuario indicado no existe"
        )
    }
    if (!usuario.activo) {
        throw new Error(
            "El usuario indicado se encuentra inactivo"
        )
    }
    if (
        usuario.empleado &&
        usuario.empleado.id !== empleadoIdActual
    ) {
        throw new Error(
            "El usuario ya está asociado a otro empleado"
        )
    }
    const codigoNormalizado =
        data.codigoEmpleado
            .trim()
            .toUpperCase()
    const empleadoConCodigo =
        await prisma.empleado.findUnique({
            where: {
                codigoEmpleado:
                    codigoNormalizado,
            },
            select: {
                id: true,
            },
        })
    if (
        empleadoConCodigo &&
        empleadoConCodigo.id !==
        empleadoIdActual
    ) {
        throw new Error(
            "El código de empleado ya está registrado"
        )
    }

    const especialidad =
        await prisma.especialidad.findUnique({
            where: {
                id: data.especialidadId,
            },
            select: {
                id: true,
                activo: true,
            },
        })
    if (!especialidad) {
        throw new Error(
            "La especialidad indicada no existe"
        )
    }
    if (!especialidad.activo) {
        throw new Error(
            "La especialidad indicada se encuentra inactiva"
        )
    }

    const servicios =
        await prisma.servicio.findMany({
            where: {
                id: {
                    in: data.servicioIds,
                },
            },
            select: {
                id: true,
                nombre: true,
                activo: true,
                especialidadId: true,
            },
        })
    if (
        servicios.length !==
        data.servicioIds.length
    ) {
        const idsEncontrados =
            new Set(
                servicios.map(
                    (servicio) =>
                        servicio.id
                )
            )
        const idsInexistentes =
            data.servicioIds.filter(
                (id) =>
                    !idsEncontrados.has(id)
            )
        throw new Error(
            `Los siguientes servicios no existen: ${idsInexistentes.join(", ")}`
        )
    }
    const serviciosInactivos =
        servicios.filter(
            (servicio) =>
                !servicio.activo
        )
    if (
        serviciosInactivos.length > 0
    ) {
        throw new Error(
            `Los siguientes servicios están inactivos: ${serviciosInactivos
                .map(
                    (servicio) =>
                        servicio.nombre
                )
                .join(", ")}`
        )
    }

    const serviciosOtraEspecialidad =
        servicios.filter(
            (servicio) =>
                servicio.especialidadId !==
                data.especialidadId
        )
    if (
        serviciosOtraEspecialidad.length >
        0
    ) {
        throw new Error(
            `Los siguientes servicios no pertenecen a la especialidad seleccionada: ${serviciosOtraEspecialidad
                .map(
                    (servicio) =>
                        servicio.nombre
                )
                .join(", ")}`
        )
    }
    return {
        codigoNormalizado,
    }
}

export const empleadoService = {
    /**
     * Lista todos los empleados para mantenimiento.
     */
    async listar() {
        return await prisma.empleado.findMany({
            include: {
                usuario: {
                    select:
                        usuarioSelect,
                },
                especialidad: true,
                servicios: {
                    orderBy: {
                        nombre: "asc",
                    },
                },
                restricciones: true,
                _count: {
                    select: {
                        citas: true,
                    },
                },
            },
            orderBy: {
                codigoEmpleado: "asc",
            },
        })
    },

    /**
     * Lista empleados activos.
     *
     * Se utiliza para seleccionar empleados al registrar
     * una cita.
     */
    async listarActivos(
        servicioId?: number
    ) {
        return await prisma.empleado.findMany({
            where: {
                activo: true,
                usuario: {
                    activo: true,
                },
                servicios:
                    servicioId
                        ? {
                            some: {
                                id:
                                    servicioId,
                                activo:
                                    true,
                            },
                        }
                        : undefined,
            },
            include: {
                usuario: {
                    select:
                        usuarioSelect,
                },
                especialidad: true,
                servicios: {
                    where: {
                        activo: true,
                    },
                    orderBy: {
                        nombre: "asc",
                    },
                },
            },
            orderBy: {
                usuario: {
                    nombre: "asc",
                },
            },
        })
    },

    /**
     * Obtiene el detalle del empleado.
     */
    async obtenerPorId(id: number) {
        return await prisma.empleado.findUnique({
            where: {
                id,
            },
            include: {
                usuario: {
                    select:
                        usuarioSelect,
                },
                especialidad: true,
                servicios: {
                    orderBy: {
                        nombre: "asc",
                    },
                },
                restricciones: {
                    orderBy: [
                        {
                            fecha: "desc",
                        },
                        {
                            horaInicio:
                                "asc",
                        },
                    ],
                },
                citas: {
                    include: {
                        cliente: {
                            select:
                                usuarioSelect,
                        },
                        servicio: true,
                        estadoCita: true,
                        adicionales: true,
                    },
                    orderBy: [
                        {
                            fecha: "desc",
                        },
                        {
                            horaInicio:
                                "asc",
                        },
                    ],
                },
            },
        })
    },

    /**
     * Crea un empleado y conecta los servicios seleccionados.
     */
    async crear(
        data: CreateEmpleadoDto
    ) {
        const { codigoNormalizado } =
            await validarDatosEmpleado(
                data
            )
        return await prisma.empleado.create({
            data: {
                usuarioId:
                    data.usuarioId,
                especialidadId:
                    data.especialidadId,
                codigoEmpleado:
                    codigoNormalizado,
                descripcion:
                    data.descripcion,
                activo:
                    true,
                servicios: {
                    connect:
                        data.servicioIds.map(
                            (id) => ({
                                id,
                            })
                        ),
                },
            },
            include: {
                usuario: {
                    select:
                        usuarioSelect,
                },
                especialidad: true,
                servicios: {
                    orderBy: {
                        nombre: "asc",
                    },
                },
            },
        })
    },

    /**
     * Modifica un empleado y reemplaza completamente
     * sus servicios.
     */
    async modificar(
        id: number,
        data: UpdateEmpleadoDto
    ) {
        const empleadoActual =
            await prisma.empleado.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                },
            })
        if (!empleadoActual) {
            throw new Error(
                "El empleado no existe"
            )
        }
        const { codigoNormalizado } =
            await validarDatosEmpleado(
                data,
                id
            )
        return await prisma.empleado.update({
            where: {
                id,
            },
            data: {
                usuarioId:
                    data.usuarioId,
                especialidadId:
                    data.especialidadId,
                codigoEmpleado:
                    codigoNormalizado,
                descripcion:
                    data.descripcion,
                servicios: {
                    set:
                        data.servicioIds.map(
                            (servicioId) => ({
                                id:
                                    servicioId,
                            })
                        ),
                },
            },
            include: {
                usuario: {
                    select:
                        usuarioSelect,
                },
                especialidad: true,
                servicios: {
                    orderBy: {
                        nombre: "asc",
                    },
                },
                restricciones: true,
            },
        })
    },
    /**
     * Activa o desactiva un empleado.
     */
    async cambiarEstado(
        id: number,
        data: UpdateEstadoEmpleadoDto
    ) {
        const empleado =
            await prisma.empleado.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    activo: true,
                },
            })
        if (!empleado) {
            throw new Error(
                "El empleado no existe"
            )
        }
        if (data.activo === false) {
            const citasActivas =
                await prisma.cita.count({
                    where: {
                        empleadoId: id,
                        estadoCita: {
                            nombre: {
                                in: estadosQueBloquean,
                            },
                        },
                    },
                })
            if (citasActivas > 0) {
                throw new Error(
                    "No se puede desactivar un empleado con citas pendientes o confirmadas"
                )
            }
        }
        return await prisma.empleado.update({
            where: {
                id,
            },
            data: {
                activo:
                    data.activo,
            },
            include: {
                usuario: {
                    select:
                        usuarioSelect,
                },
                especialidad: true,
                servicios: true,
            },
        })
    },

    /**
     * Consulta la agenda operativa del empleado.
     *
     * Las citas canceladas no se consideran ocupadas y
     * no se incluyen en la agenda operativa.
     */
    async agenda(
        id: number,
        fecha: string
    ) {
        const fechaDate =
            new Date(
                `${fecha}T00:00:00`
            )
        return await prisma.empleado.findUnique({
            where: {
                id,
            },
            include: {
                usuario: {
                    select:
                        usuarioSelect,
                },
                especialidad: true,
                servicios: {
                    where: {
                        activo: true,
                    },
                    orderBy: {
                        nombre: "asc",
                    },
                },
                citas: {
                    where: {
                        fecha:
                            fechaDate,
                        estadoCita: {
                            nombre: {
                                not:
                                    "Cancelada",
                            },
                        },
                    },
                    include: {
                        cliente: {
                            select:
                                usuarioSelect,
                        },
                        servicio: true,
                        estadoCita: true,
                        adicionales: true,
                    },
                    orderBy: {
                        horaInicio:
                            "asc",
                    },
                },
                restricciones: {
                    where: {
                        fecha:
                            fechaDate,
                        activo:
                            true,
                    },
                    include: {
                        tipoRestriccion:
                            true,
                    },
                    orderBy: {
                        horaInicio:
                            "asc",
                    },
                },
            },
        })
    },
}