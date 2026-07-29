import { prisma } from "../config/prisma";

export const rolService = {
    async listar() {
        return await prisma.rol.findMany({
            orderBy: { nombre: "asc" },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.rol.findUnique({
            where: { id }
        });
    },
};