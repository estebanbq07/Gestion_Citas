import { prisma } from "../config/prisma";

import {
    CreateServicioDto,
    UpdateEstadoServicioDto,
    UpdateServicioDto,
} from "../dtos/servicio.dto";

/**
 * Estados que impiden desactivar un servicio.
 *
 * Una cita cancelada o finalizada no bloquea
 * la desactivación.
 */
const estadosQueBloquean = [
    "Pendiente",
    "Confirmada",
];

/**
 * Selección segura del usuario relacionado con un empleado.
 *
 * No se retorna passwordHash.
 */
const usuarioEmpleadoSelect = {
    id: true,
    nombre: true,
    primerApellido: true,
    segundoApellido: true,
    correo: true,
    telefono: true,
    activo: true,
    rolId: true,
} as const;

export const servicioService = {
    /**
     * Lista todos los servicios.
     *
     * Se utiliza en el mantenimiento administrativo.
     */
    async listar() {
        return await prisma.servicio.findMany({
            include: {
                especialidad: true,
                empleados: {
                    include: {
                        usuario: {
                            select:
                                usuarioEmpleadoSelect,
                        },
                    },
                },
            },
            orderBy: {
                nombre: "asc",
            },
        });
    },

    /**
     * Lista únicamente servicios activos.
     *
     * Se utiliza en formularios de citas y pantallas públicas.
     */
    async listarActivos() {
        return await prisma.servicio.findMany({
            where: {
                activo: true,
            },
            include: {
                especialidad: true,
            },
            orderBy: {
                nombre: "asc",
            },
        });
    },
    /**
     * Consulta el detalle de un servicio.
     */
    async obtenerPorId(id: number) {
        return await prisma.servicio.findUnique({
            where: {
                id,
            },
            include: {
                especialidad: true,
                empleados: {
                    include: {
                        usuario: {
                            select:
                                usuarioEmpleadoSelect,
                        },
                    },
                },
                citas: {
                    include: {
                        estadoCita: true,
                    },
                    orderBy: {
                        fecha: "desc",
                    },
                },
            },
        });
    },

    /**
     * Crea un servicio.
     */
    async crear(data: CreateServicioDto) {
        const nombreNormalizado =
            data.nombre.trim();
        const servicioExistente =
            await prisma.servicio.findFirst({
                where: {
                    nombre: {
                        equals:
                            nombreNormalizado,
                    },
                },
                select: {
                    id: true,
                },
            });
        if (servicioExistente) {
            throw new Error(
                "Ya existe un servicio con ese nombre"
            );
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
            });
        if (!especialidad) {
            throw new Error(
                "La especialidad indicada no existe"
            );
        }
        if (!especialidad.activo) {
            throw new Error(
                "La especialidad indicada se encuentra inactiva"
            );
        }
        return await prisma.servicio.create({
            data: {
                nombre:
                    nombreNormalizado,
                descripcion:
                    data.descripcion.trim(),
                precioBase:
                    data.precioBase,
                duracionMinutos:
                    data.duracionMinutos,
                especialidadId:
                    data.especialidadId,
                imagen:
                    data.imagen,
                activo:
                    true,
            },
            include: {
                especialidad: true,
            },
        });
    },
    /**
     * Modifica todos los datos editables del servicio.
     */
    async modificar(
        id: number,
        data: UpdateServicioDto
    ) {
        const servicioActual =
            await prisma.servicio.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    nombre: true,
                    imagen: true,
                },
            });
        if (!servicioActual) {
            throw new Error(
                "El servicio no existe"
            );
        }
        const nombreNormalizado =
            data.nombre.trim();
        const servicioConMismoNombre =
            await prisma.servicio.findFirst({
                where: {
                    nombre: {
                        equals:
                            nombreNormalizado,
                    },
                    id: {
                        not: id,
                    },
                },
                select: {
                    id: true,
                },
            });
        if (servicioConMismoNombre) {
            throw new Error(
                "Ya existe otro servicio con ese nombre"
            );
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
            });
        if (!especialidad) {
            throw new Error(
                "La especialidad indicada no existe"
            );
        }
        if (!especialidad.activo) {
            throw new Error(
                "La especialidad indicada se encuentra inactiva"
            );
        }
        return await prisma.servicio.update({
            where: {
                id,
            },
            data: {
                nombre:
                    nombreNormalizado,
                descripcion:
                    data.descripcion.trim(),
                precioBase:
                    data.precioBase,
                duracionMinutos:
                    data.duracionMinutos,
                especialidadId:
                    data.especialidadId,
                imagen:
                    data.imagen,
            },
            include: {
                especialidad: true,
                empleados: {
                    include: {
                        usuario: {
                            select:
                                usuarioEmpleadoSelect,
                        },
                    },
                },
            },
        });
    },

    /**
     * Activa o desactiva un servicio.
     */
    async cambiarEstado(
        id: number,
        data: UpdateEstadoServicioDto
    ) {
        const servicio =
            await prisma.servicio.findUnique({
                where: {
                    id,
                },

                select: {
                    id: true,
                    activo: true,
                },
            });
        if (!servicio) {
            throw new Error(
                "El servicio no existe"
            );
        }
        /*
         * Solo se validan citas cuando se intenta desactivar.
         */
        if (data.activo === false) {
            const citasQueBloquean =
                await prisma.cita.count({
                    where: {
                        servicioId: id,
                        estadoCita: {
                            nombre: {
                                in: estadosQueBloquean,
                            },
                        },
                    },
                });
            if (citasQueBloquean > 0) {
                throw new Error(
                    "No se puede desactivar un servicio con citas pendientes o confirmadas"
                );
            }
        }
        return await prisma.servicio.update({
            where: {
                id,
            },
            data: {
                activo:
                    data.activo,
            },
            include: {
                especialidad: true,
            },
        });
    },
};