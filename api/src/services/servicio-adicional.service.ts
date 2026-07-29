import { prisma } from "../config/prisma";

import {
    CreateServicioAdicionalDto,
    UpdateEstadoServicioAdicionalDto,
    UpdateServicioAdicionalDto,
} from "../dtos/servicio-adicional.dto";

/**
 * Información segura de usuarios.
 *
 * Nunca se incluye passwordHash.
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
} as const;

export const servicioAdicionalService = {
    /**
     * Lista todos los servicios adicionales.
     *
     * Se utiliza en el mantenimiento administrativo.
     */
    async listar() {
        return await prisma.servicioAdicional.findMany({
            orderBy: {
                nombre: "asc",
            },
        });
    },

    /**
     * Lista únicamente los adicionales activos.
     *
     * Se utiliza en el formulario de registro de citas.
     */
    async listarActivos() {
        return await prisma.servicioAdicional.findMany({
            where: {
                activo: true,
            },
            orderBy: {
                nombre: "asc",
            },
        });
    },
    /**
     * Obtiene el detalle de un adicional.
     */
    async obtenerPorId(id: number) {
        return await prisma.servicioAdicional.findUnique({
            where: {
                id,
            },
            include: {
                citas: {
                    include: {
                        cliente: {
                            select: usuarioSelect,
                        },
                        empleado: {
                            include: {
                                usuario: {
                                    select:
                                        usuarioSelect,
                                },
                            },
                        },
                        servicio: true,
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
     * Crea un servicio adicional.
     *
     * Todo adicional nuevo se crea activo.
     */
    async crear(
        data: CreateServicioAdicionalDto
    ) {
        const nombreNormalizado =
            data.nombre.trim();
        const adicionalExistente =
            await prisma.servicioAdicional.findFirst({
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
        if (adicionalExistente) {
            throw new Error(
                "Ya existe un servicio adicional con ese nombre"
            );
        }
        return await prisma.servicioAdicional.create({
            data: {
                nombre:
                    nombreNormalizado,
                descripcion:
                    data.descripcion.trim(),
                precio:
                    data.precio,
                activo:
                    true,
            },
        });
    },
    /**
     * Modifica todos los datos editables.
     *
     * No modifica el estado activo.
     */
    async modificar(
        id: number,
        data: UpdateServicioAdicionalDto
    ) {
        const adicionalActual =
            await prisma.servicioAdicional.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                },
            });
        if (!adicionalActual) {
            throw new Error(
                "El servicio adicional no existe"
            );
        }
        const nombreNormalizado =
            data.nombre.trim();
        const adicionalConMismoNombre =
            await prisma.servicioAdicional.findFirst({
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
        if (adicionalConMismoNombre) {
            throw new Error(
                "Ya existe otro servicio adicional con ese nombre"
            );
        }
        return await prisma.servicioAdicional.update({
            where: {
                id,
            },
            data: {
                nombre:
                    nombreNormalizado,
                descripcion:
                    data.descripcion.trim(),
                precio:
                    data.precio,
            },
        });
    },
    /**
     * Activa o desactiva un servicio adicional.
     *
     * No elimina las relaciones con citas anteriores.
     * Al desactivarlo, deja de aparecer en la selección
     * de nuevas citas.
     */
    async cambiarEstado(
        id: number,
        data: UpdateEstadoServicioAdicionalDto
    ) {
        const adicional =
            await prisma.servicioAdicional.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    activo: true,
                },
            });
        if (!adicional) {
            throw new Error(
                "El servicio adicional no existe"
            );
        }
        return await prisma.servicioAdicional.update({
            where: {
                id,
            },
            data: {
                activo:
                    data.activo,
            },
        });
    },
};