import { prisma } from "../config/prisma";

export const estadoCitaService = {
    async listar() {
        return await prisma.estadoCita.findMany({
            where: { activo: true },
            orderBy: [{ orden: "asc" }, { nombre: "asc" }],
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.estadoCita.findUnique({
            where: { id },
            include: { citas: true },
        });
    },
};