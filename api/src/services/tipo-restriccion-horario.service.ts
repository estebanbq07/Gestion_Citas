import { prisma } from "../config/prisma";

export const tipoRestriccionHorarioService = {
    async listar() {
        return await prisma.tipoRestriccionHorario.findMany({
            orderBy: { nombre: "asc" },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.tipoRestriccionHorario.findUnique({
            where: { id },
            include: { restricciones: true },
        });
    },
};