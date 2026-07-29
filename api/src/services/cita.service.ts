import { prisma } from "../config/prisma"
import {
    toDateOnly,
    toTime,
} from "./common.service"
import {
    CreateCitaDto,
    DisponibilidadDto,
    UpdateCitaDto,
} from "../dtos/cita.dto"

/**
 * Información segura de usuario.
 *
 * Nunca devuelve passwordHash.
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
 * Relaciones incluidas en las respuestas de citas.
 */
const citaInclude = {
    cliente: {
        select:
            usuarioSelect,
    },
    empleado: {
        include: {
            usuario: {
                select:
                    usuarioSelect,
            },
            especialidad: true,
        },
    },
    servicio: true,
    estadoCita: true,
    creadoPor: {
        select:
            usuarioSelect,
    },
    adicionales: true,
} as const

/**
 * Convierte el día JavaScript a un orden de lunes a domingo.
 *
 * JavaScript:
 * domingo = 0
 * lunes = 1
 *
 * Sistema:
 * lunes = 1
 * domingo = 7
 */
function obtenerNumeroDia(
    fecha: string
) {
    const date =
        new Date(
            `${fecha}T12:00:00`
        )
    const day =
        date.getDay()
    return day === 0
        ? 7
        : day
}

/**
 * Valida que un usuario exista, esté activo y tenga
 * el rol Cliente.
 */
async function validarCliente(
    clienteId: number
) {
    const cliente =
        await prisma.usuario.findUnique({
            where: {
                id: clienteId,
            },
            select: {
                id: true,
                activo: true,
                rol: {
                    select: {
                        nombre: true,
                        activo: true,
                    },
                },
            },
        })
    if (!cliente) {
        throw new Error(
            "El cliente indicado no existe"
        )
    }
    if (!cliente.activo) {
        throw new Error(
            "El cliente indicado se encuentra inactivo"
        )
    }
    if (
        cliente.rol.nombre !==
        "Cliente"
    ) {
        throw new Error(
            "El usuario indicado no posee el rol Cliente"
        )
    }
    if (!cliente.rol.activo) {
        throw new Error(
            "El rol Cliente se encuentra inactivo"
        )
    }
}

/**
 * Valida el usuario que registró la cita.
 *
 * No se aplica autorización por rol.
 */
async function validarUsuarioCreador(
    usuarioId: number
) {
    const usuario =
        await prisma.usuario.findUnique({
            where: {
                id: usuarioId,
            },
            select: {
                id: true,
                activo: true,
            },
        })
    if (!usuario) {
        throw new Error(
            "El usuario creador no existe"
        )
    }
    if (!usuario.activo) {
        throw new Error(
            "El usuario creador se encuentra inactivo"
        )
    }
}

/**
 * Valida el estado utilizado al crear una cita.
 */
async function validarEstadoInicial(
    estadoCitaId: number
) {
    const estado =
        await prisma.estadoCita.findUnique({
            where: {
                id: estadoCitaId,
            },
            select: {
                id: true,
                activo: true,
            },
        })
    if (!estado) {
        throw new Error(
            "El estado de cita indicado no existe"
        )
    }
    if (!estado.activo) {
        throw new Error(
            "El estado de cita indicado se encuentra inactivo"
        )
    }
}

/**
 * Valida adicionales.
 *
 * No calcula el costo y no modifica la duración.
 */
async function validarAdicionales(
    adicionalIds: number[]
) {
    if (
        adicionalIds.length === 0
    ) {
        return
    }

    const adicionales =
        await prisma.servicioAdicional.findMany({
            where: {
                id: {
                    in:
                        adicionalIds,
                },
            },
            select: {
                id: true,
                nombre: true,
                activo: true,
            },
        })
    if (
        adicionales.length !==
        adicionalIds.length
    ) {
        const idsEncontrados =
            new Set(
                adicionales.map(
                    (adicional) =>
                        adicional.id
                )
            )
        const idsInexistentes =
            adicionalIds.filter(
                (id) =>
                    !idsEncontrados.has(id)
            )
        throw new Error(
            `Los siguientes servicios adicionales no existen: ${idsInexistentes.join(", ")}`
        )
    }
    const inactivos =
        adicionales.filter(
            (adicional) =>
                !adicional.activo
        )
    if (inactivos.length > 0) {
        throw new Error(
            `Los siguientes servicios adicionales se encuentran inactivos: ${inactivos
                .map(
                    (adicional) =>
                        adicional.nombre
                )
                .join(", ")}`
        )
    }
}

/**
 * Verifica todas las reglas de disponibilidad.
 */
async function verificarDisponibilidad(
    data: DisponibilidadDto
) {
    const fechaDate =
        toDateOnly(data.fecha)
    const horaInicio =
        toTime(data.horaInicio)
    const horaFin =
        toTime(data.horaFin)
    const empleado =
        await prisma.empleado.findUnique({
            where: {
                id:
                    data.empleadoId,
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        activo: true,
                    },
                },
                servicios: {
                    select: {
                        id: true,
                        nombre: true,
                        activo: true,
                    },
                },
            },
        })

    if (!empleado) {
        return {
            disponible: false,
            motivo:
                "El empleado no existe",
        }
    }
    if (
        !empleado.activo ||
        !empleado.usuario.activo
    ) {
        return {
            disponible: false,
            motivo:
                "El empleado se encuentra inactivo",
        }
    }
    const servicio =
        await prisma.servicio.findUnique({
            where: {
                id:
                    data.servicioId,
            },
            select: {
                id: true,
                nombre: true,
                activo: true,
            },
        })
    if (!servicio) {
        return {
            disponible: false,
            motivo:
                "El servicio no existe",
        }
    }
    if (!servicio.activo) {
        return {
            disponible: false,
            motivo:
                "El servicio se encuentra inactivo",
        }
    }

    const servicioAsignado =
        empleado.servicios.some(
            (item) =>
                item.id ===
                    data.servicioId &&
                item.activo
        )
    if (!servicioAsignado) {
        return {
            disponible: false,
            motivo:
                "El servicio no está asignado al empleado",
        }
    }
    const numeroDia =
        obtenerNumeroDia(
            data.fecha
        )
    const horarios =
        await prisma.horarioAtencion.findMany({
            where: {
                activo: true,
                diaSemana: {
                    numeroOrden:
                        numeroDia,
                },
            },
            orderBy: {
                horaInicio: "asc",
            },
        })
    if (horarios.length === 0) {
        return {
            disponible: false,
            motivo:
                "El establecimiento no atiende en la fecha seleccionada",
        }
    }

    const dentroHorario =
        horarios.some(
            (horario) =>
                horaInicio >=
                    horario.horaInicio &&
                horaFin <=
                    horario.horaFin
        )

    if (!dentroHorario) {
        return {
            disponible: false,
            motivo:
                "El horario solicitado se encuentra fuera del horario de atención",
        }
    }

    const restricciones =
        await prisma.restriccionHorario.findMany({
            where: {
                fecha:
                    fechaDate,
                activo:
                    true,
                OR: [
                    {
                        empleadoId:
                            null,
                    },
                    {
                        empleadoId:
                            data.empleadoId,
                    },
                ],
            },
            select: {
                id: true,
                todoElDia: true,
                horaInicio: true,
                horaFin: true,
                motivo: true,
            },
        })

    const restriccionEncontrada =
        restricciones.find(
            (restriccion) => {
                if (
                    restriccion.todoElDia
                ) {
                    return true
                }
                if (
                    !restriccion.horaInicio ||
                    !restriccion.horaFin
                ) {
                    return false
                }
                return (
                    horaInicio <
                        restriccion.horaFin &&
                    horaFin >
                        restriccion.horaInicio
                )
            }
        )
    if (restriccionEncontrada) {
        return {
            disponible: false,
            motivo:
                restriccionEncontrada.motivo ||
                "El horario coincide con una restricción",
        }
    }

    const traslape =
        await prisma.cita.findFirst({
            where: {
                id:
                    data.citaIdExcluir
                        ? {
                              not:
                                  data.citaIdExcluir,
                          }
                        : undefined,
                empleadoId:
                    data.empleadoId,
                fecha:
                    fechaDate,
                estadoCita: {
                    bloqueaDisponibilidad:
                        true,
                },
                AND: [
                    {
                        horaInicio: {
                            lt:
                                horaFin,
                        },
                    },
                    {
                        horaFin: {
                            gt:
                                horaInicio,
                        },
                    },
                ],
            },
            select: {
                id: true,
                horaInicio: true,
                horaFin: true,
                estadoCita: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
            },
        })
    if (traslape) {
        return {
            disponible: false,
            motivo:
                "El horario se traslapa con otra cita",
            cita:
                traslape,
        }
    }
    return {
        disponible: true,
        motivo:
            "Horario disponible",
    }
}

export const citaService = {
    /**
     * Lista todas las citas.
     */
    async listar() {
        return await prisma.cita.findMany({
            include:
                citaInclude,
            orderBy: [
                {
                    fecha: "desc",
                },
                {
                    horaInicio:
                        "asc",
                },
            ],
        })
    },

    /**
     * Lista las citas de un cliente.
     */
    async listarPorCliente(
        clienteId: number
    ) {
        const cliente =
            await prisma.usuario.findUnique({
                where: {
                    id:
                        clienteId,
                },
                select: {
                    id: true,
                },
            })
        if (!cliente) {
            throw new Error(
                "El cliente no existe"
            )
        }
        return await prisma.cita.findMany({
            where: {
                clienteId,
            },
            include:
                citaInclude,
            orderBy: [
                {
                    fecha: "desc",
                },
                {
                    horaInicio:
                        "asc",
                },
            ],
        })
    },

    /**
     * Lista las citas de un empleado.
     */
    async listarPorEmpleado(
        empleadoId: number
    ) {
        const empleado =
            await prisma.empleado.findUnique({
                where: {
                    id:
                        empleadoId,
                },
                select: {
                    id: true,
                },
            })
        if (!empleado) {
            throw new Error(
                "El empleado no existe"
            )
        }
        return await prisma.cita.findMany({
            where: {
                empleadoId,
            },
            include:
                citaInclude,
            orderBy: [
                {
                    fecha: "desc",
                },
                {
                    horaInicio:
                        "asc",
                },
            ],
        })
    },

    /**
     * Obtiene el detalle de una cita.
     */
    async obtenerPorId(
        id: number
    ) {
        return await prisma.cita.findUnique({
            where: {
                id,
            },
            include:
                citaInclude,
        })
    },

    /**
     * Crea una cita.
     *
     * Los costos y la duración se guardan exactamente
     * como fueron enviados.
     */
    async crear(
        data: CreateCitaDto
    ) {
        await validarCliente(
            data.clienteId
        )
        await validarUsuarioCreador(
            data.creadoPorUsuarioId
        )
        await validarEstadoInicial(
            data.estadoCitaId
        )
        await validarAdicionales(
            data.adicionalIds
        )
        const disponibilidad =
            await verificarDisponibilidad({
                empleadoId:
                    data.empleadoId,
                servicioId:
                    data.servicioId,
                fecha:
                    data.fecha,
                horaInicio:
                    data.horaInicio,
                horaFin:
                    data.horaFin,
                citaIdExcluir:
                    null,
            })
        if (!disponibilidad.disponible) {
            throw new Error(
                disponibilidad.motivo
            )
        }

        return await prisma.cita.create({
            data: {
                clienteId:
                    data.clienteId,
                empleadoId:
                    data.empleadoId,
                servicioId:
                    data.servicioId,
                estadoCitaId:
                    data.estadoCitaId,
                creadoPorUsuarioId:
                    data.creadoPorUsuarioId,
                fecha:
                    toDateOnly(
                        data.fecha
                    ),
                horaInicio:
                    toTime(
                        data.horaInicio
                    ),
                horaFin:
                    toTime(
                        data.horaFin
                    ),
                /**
                 * Se guardan los valores enviados.
                 * No se recalculan.
                 */
                duracionMinutos:
                    data.duracionMinutos,
                precioServicio:
                    data.precioServicio,
                costoAdicionales:
                    data.costoAdicionales,
                costoTotal:
                    data.costoTotal,
                observaciones:
                    data.observaciones,
                adicionales: {
                    connect:
                        data.adicionalIds.map(
                            (id) => ({
                                id,
                            })
                        ),
                },
            },
            include:
                citaInclude,
        })
    },

    /**
     * Modifica todos los datos editables.
     *
     * No modifica el estado ni el usuario creador.
     */
    async modificar(
        id: number,
        data: UpdateCitaDto
    ) {
        const citaActual =
            await prisma.cita.findUnique({
                where: {
                    id,
                },
                include: {
                    estadoCita: true,
                },
            })
        if (!citaActual) {
            throw new Error(
                "La cita no existe"
            )
        }
        if (
            !citaActual.estadoCita
                .permiteEdicion
        ) {
            throw new Error(
                `No se puede modificar una cita con estado ${citaActual.estadoCita.nombre}`
            )
        }
        await validarCliente(
            data.clienteId
        )
        await validarAdicionales(
            data.adicionalIds
        )

        const disponibilidad =
            await verificarDisponibilidad({
                empleadoId:
                    data.empleadoId,
                servicioId:
                    data.servicioId,
                fecha:
                    data.fecha,
                horaInicio:
                    data.horaInicio,
                horaFin:
                    data.horaFin,
                citaIdExcluir:
                    id,
            })
        if (!disponibilidad.disponible) {
            throw new Error(
                disponibilidad.motivo
            )
        }
        return await prisma.cita.update({
            where: {
                id,
            },
            data: {
                clienteId:
                    data.clienteId,
                empleadoId:
                    data.empleadoId,
                servicioId:
                    data.servicioId,
                fecha:
                    toDateOnly(
                        data.fecha
                    ),
                horaInicio:
                    toTime(
                        data.horaInicio
                    ),
                horaFin:
                    toTime(
                        data.horaFin
                    ),
                /**
                 * Se guardan los valores enviados.
                 * No se recalculan.
                 */
                duracionMinutos:
                    data.duracionMinutos,
                precioServicio:
                    data.precioServicio,
                costoAdicionales:
                    data.costoAdicionales,
                costoTotal:
                    data.costoTotal,
                observaciones:
                    data.observaciones,
                adicionales: {
                    set:
                        data.adicionalIds.map(
                            (adicionalId) => ({
                                id:
                                    adicionalId,
                            })
                        ),
                },
            },
            include:
                citaInclude,
        })
    },

    /**
     * Cancela una cita.
     */
    async cancelar(
        id: number,
        motivoCancelacion: string
    ) {
        const cita =
            await prisma.cita.findUnique({
                where: {
                    id,
                },
                include: {
                    estadoCita: true,
                },
            })
        if (!cita) {
            throw new Error(
                "La cita no existe"
            )
        }
        if (
            cita.estadoCita.nombre ===
            "Cancelada"
        ) {
            throw new Error(
                "La cita ya se encuentra cancelada"
            )
        }
        if (
            !cita.estadoCita
                .permiteCancelacionCliente
        ) {
            throw new Error(
                `No se puede cancelar una cita con estado ${cita.estadoCita.nombre}`
            )
        }
        const estadoCancelada =
            await prisma.estadoCita.findUnique({
                where: {
                    nombre:
                        "Cancelada",
                },
                select: {
                    id: true,
                    activo: true,
                },
            })
        if (!estadoCancelada) {
            throw new Error(
                "No existe el estado Cancelada"
            )
        }
        if (!estadoCancelada.activo) {
            throw new Error(
                "El estado Cancelada se encuentra inactivo"
            )
        }
        return await prisma.cita.update({
            where: {
                id,
            },
            data: {
                estadoCitaId:
                    estadoCancelada.id,
                motivoCancelacion:
                    motivoCancelacion.trim(),
            },
            include:
                citaInclude,
        })
    },

    /**
     * Cambia el estado de una cita.
     */
    async cambiarEstado(
        id: number,
        estadoCitaId: number
    ) {
        const cita =
            await prisma.cita.findUnique({
                where: {
                    id,
                },
                include: {
                    estadoCita: true,
                },
            })
        if (!cita) {
            throw new Error(
                "La cita no existe"
            )
        }
        const nuevoEstado =
            await prisma.estadoCita.findUnique({
                where: {
                    id:
                        estadoCitaId,
                },
                select: {
                    id: true,
                    nombre: true,
                    activo: true,
                },
            })
        if (!nuevoEstado) {
            throw new Error(
                "El estado de cita indicado no existe"
            )
        }
        if (!nuevoEstado.activo) {
            throw new Error(
                "El estado de cita indicado se encuentra inactivo"
            )
        }
        if (
            cita.estadoCita.nombre ===
                "Cancelada" &&
            nuevoEstado.nombre ===
                "Finalizada"
        ) {
            throw new Error(
                "Una cita cancelada no puede cambiarse directamente a Finalizada"
            )
        }
        return await prisma.cita.update({
            where: {
                id,
            },
            data: {
                estadoCitaId:
                    nuevoEstado.id,
                motivoCancelacion:
                    nuevoEstado.nombre ===
                    "Cancelada"
                        ? cita.motivoCancelacion
                        : null,
            },
            include:
                citaInclude,
        })
    },
    /**
     * Consulta disponibilidad.
     */
    async disponibilidad(
        data: DisponibilidadDto
    ) {
        return await verificarDisponibilidad(
            data
        )
    },
    /**
     * Consulta la agenda de un empleado.
     */
    async agendaEmpleado(
        empleadoId: number,
        fecha: string
    ) {
        const empleado =
            await prisma.empleado.findUnique({
                where: {
                    id:
                        empleadoId,
                },
                include: {
                    usuario: {
                        select:
                            usuarioSelect,
                    },
                    especialidad: true,
                    servicios: {
                        where: {
                            activo:
                                true,
                        },
                    },
                },
            })
        if (!empleado) {
            throw new Error(
                "El empleado no existe"
            )
        }
        const fechaDate =
            toDateOnly(fecha)
        const numeroDia =
            obtenerNumeroDia(
                fecha
            )
        const horarios =
            await prisma.horarioAtencion.findMany({
                where: {
                    activo: true,
                    diaSemana: {
                        numeroOrden:
                            numeroDia,
                    },
                },
                include: {
                    diaSemana: true,
                },
                orderBy: {
                    horaInicio: "asc",
                },
            })
        const restricciones =
            await prisma.restriccionHorario.findMany({
                where: {
                    fecha:
                        fechaDate,
                    activo:
                        true,
                    OR: [
                        {
                            empleadoId:
                                null,
                        },
                        {
                            empleadoId,
                        },
                    ],
                },
                include: {
                    tipoRestriccion:
                        true,
                },
                orderBy: {
                    horaInicio: "asc",
                },
            })
        const citas =
            await prisma.cita.findMany({
                where: {
                    empleadoId,
                    fecha:
                        fechaDate,
                    estadoCita: {
                        bloqueaDisponibilidad:
                            true,
                    },
                },
                include:
                    citaInclude,
                orderBy: {
                    horaInicio: "asc",
                },
            })
        return {
            fecha,
            empleado,
            horarios,
            restricciones,
            citas,
        }
    },

    /**
     * Consulta la agenda general.
     */
    async agendaDiaria(
        fecha: string
    ) {
        const fechaDate =
            toDateOnly(fecha)
        const numeroDia =
            obtenerNumeroDia(
                fecha
            )
        const horarios =
            await prisma.horarioAtencion.findMany({
                where: {
                    activo: true,
                    diaSemana: {
                        numeroOrden:
                            numeroDia,
                    },
                },
                include: {
                    diaSemana: true,
                },
                orderBy: {
                    horaInicio: "asc",
                },
            })
        const empleados =
            await prisma.empleado.findMany({
                where: {
                    activo: true,
                    usuario: {
                        activo: true,
                    },
                },
                include: {
                    usuario: {
                        select:
                            usuarioSelect,
                    },
                    especialidad: true,
                    servicios: {
                        where: {
                            activo:
                                true,
                        },
                    },
                    citas: {
                        where: {
                            fecha:
                                fechaDate,
                            estadoCita: {
                                bloqueaDisponibilidad:
                                    true,
                            },
                        },
                        include:
                            citaInclude,
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
                    },
                },
                orderBy: {
                    usuario: {
                        nombre: "asc",
                    },
                },
            })

        const restriccionesGenerales =
            await prisma.restriccionHorario.findMany({
                where: {
                    fecha:
                        fechaDate,
                    empleadoId:
                        null,
                    activo:
                        true,
                },
                include: {
                    tipoRestriccion:
                        true,
                },
                orderBy: {
                    horaInicio: "asc",
                },
            })
        return {
            fecha,
            horarios,
            empleados,
            restriccionesGenerales,
        }
    },
}