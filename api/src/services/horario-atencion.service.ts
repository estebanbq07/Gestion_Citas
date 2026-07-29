import { prisma } from "../config/prisma";
import {
    toTime,
} from "./common.service";
import {
    CreateHorarioAtencionDto,
    UpdateEstadoHorarioAtencionDto,
    UpdateHorarioAtencionDto,
} from "../dtos/horario-atencion.dto";

/**
 * Valida el día y los traslapes de horario.
 */
async function validarHorario(
    data: {
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    },
    horarioIdExcluir?: number
) {
    const diaSemana =
        await prisma.diaSemana.findUnique({
            where: {
                id:
                    data.diaSemanaId,
            },
            select: {
                id: true,
            },
        });
    if (!diaSemana) {
        throw new Error(
            "El día de la semana indicado no existe"
        );
    }
    const horaInicio =
        toTime(
            data.horaInicio
        );
    const horaFin =
        toTime(
            data.horaFin
        );
    const horarioTraslapado =
        await prisma.horarioAtencion.findFirst({
            where: {
                id:
                    horarioIdExcluir
                        ? {
                            not:
                                horarioIdExcluir,
                        }
                        : undefined,
                diaSemanaId:
                    data.diaSemanaId,
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
            },
        });
    if (horarioTraslapado) {
        throw new Error(
            "El horario se traslapa con otro horario registrado para el mismo día"
        );
    }
    return {
        horaInicio,
        horaFin,
    };
}

export const horarioAtencionService = {
    /**
     * Lista todos los horarios.
     */
    async listar() {
        return await prisma.horarioAtencion.findMany({
            include: {
                diaSemana: true,
            },
            orderBy: [
                {
                    diaSemana: {
                        numeroOrden:
                            "asc",
                    },
                },
                {
                    horaInicio:
                        "asc",
                },
            ],
        });
    },
    /**
     * Obtiene un horario por ID.
     */
    async obtenerPorId(
        id: number
    ) {
        return await prisma.horarioAtencion.findUnique({
            where: {
                id,
            },
            include: {
                diaSemana: true,
            },
        });
    },
    /**
     * Crea un horario activo.
     */
    async crear(
        data: CreateHorarioAtencionDto
    ) {
        const {
            horaInicio,
            horaFin,
        } = await validarHorario(
            data
        );
        return await prisma.horarioAtencion.create({
            data: {
                diaSemanaId:
                    data.diaSemanaId,
                horaInicio,
                horaFin,
                activo:
                    true,
            },
            include: {
                diaSemana: true,
            },
        });
    },
    /**
     * Modifica completamente un horario.
     */
    async modificar(
        id: number,
        data: UpdateHorarioAtencionDto
    ) {
        const horarioActual =
            await prisma.horarioAtencion.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                },
            });
        if (!horarioActual) {
            throw new Error(
                "El horario de atención no existe"
            );
        }
        const {
            horaInicio,
            horaFin,
        } = await validarHorario(
            data,
            id
        );
        return await prisma.horarioAtencion.update({
            where: {
                id,
            },
            data: {
                diaSemanaId:
                    data.diaSemanaId,
                horaInicio,
                horaFin,
            },
            include: {
                diaSemana: true,
            },
        });
    },
    /**
     * Activa o desactiva un horario.
     */
    async cambiarEstado(
        id: number,
        data: UpdateEstadoHorarioAtencionDto
    ) {
        const horario =
            await prisma.horarioAtencion.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                },
            });
        if (!horario) {
            throw new Error(
                "El horario de atención no existe"
            );
        }
        return await prisma.horarioAtencion.update({
            where: {
                id,
            },
            data: {
                activo:
                    data.activo,
            },
            include: {
                diaSemana: true,
            },
        });
    },
};