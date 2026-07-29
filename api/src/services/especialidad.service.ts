import { prisma } from "../config/prisma";

export const especialidadService = {
    async listar() {
        return await prisma.especialidad.findMany({
            orderBy: { nombre: "asc" },
            include: {
                servicios: true,
                empleados: {
                    include: { usuario: true },
                },
            },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.especialidad.findUnique({
            where: { id },
            include: {
                servicios: true,
                empleados: {
                    include: { usuario: true },
                },
            },
        });
    },
};