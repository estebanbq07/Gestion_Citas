import { z } from "zod"
import {
    idSchema,
    timeSchema,
} from "./common.dto"

/**
 * Crear un horario de atención.
 *
 * Todo horario nuevo se crea activo.
 */
export const createHorarioAtencionSchema = z
    .object({
        diaSemanaId:
            idSchema,
        horaInicio:
            timeSchema,
        horaFin:
            timeSchema,
    })
    .strict()
    .refine(
        (data) =>
            data.horaInicio <
            data.horaFin,
        {
            path: ["horaFin"],
            message:
                "La hora de fin debe ser mayor que la hora de inicio",
        }
    )

/**
 * Modificar completamente un horario.
 *
 * Como se utiliza PUT, todos los atributos editables
 * deben enviarse.
 */
export const updateHorarioAtencionSchema = z
    .object({
        diaSemanaId:
            idSchema,
        horaInicio:
            timeSchema,
        horaFin:
            timeSchema,
    })
    .strict()
    .refine(
        (data) =>
            data.horaInicio <
            data.horaFin,
        {
            path: ["horaFin"],
            message:
                "La hora de fin debe ser mayor que la hora de inicio",
        }
    )

/**
 * Activar o desactivar un horario.
 */
export const updateEstadoHorarioAtencionSchema = z
    .object({
        activo: z.boolean({
            message:
                "El estado activo es obligatorio",
        }),
    })
    .strict()
export type CreateHorarioAtencionDto =
    z.infer<
        typeof createHorarioAtencionSchema
    >
export type UpdateHorarioAtencionDto =
    z.infer<
        typeof updateHorarioAtencionSchema
    >
export type UpdateEstadoHorarioAtencionDto =
    z.infer<
        typeof updateEstadoHorarioAtencionSchema
    >