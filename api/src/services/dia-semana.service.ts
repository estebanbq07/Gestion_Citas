// src/services/dia-semana.service.ts
import { prisma } from "../config/prisma";

export const diaSemanaService = {
    async listar() {
        return await prisma.diaSemana.findMany({
            include: { horarios: true },
            orderBy: { numeroOrden: "asc" },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.diaSemana.findUnique({
            where: { id },
            include: { horarios: true },
        });
    },
};