import { z } from "zod"
import {
    dateOnlySchema,
    idSchema,
    timeSchema,
} from "./common.dto"

const motivoSchema = z
    .string({
        message:
            "El motivo es obligatorio",
    })
    .trim()
    .min(
        5,
        "El motivo debe contener al menos 5 caracteres"
    )
    .max(
        255,
        "El motivo no puede superar 255 caracteres"
    )

const restriccionBaseSchema = z
    .object({
        tipoRestriccionId:
            idSchema,
        empleadoId:
            idSchema
                .nullable(),
        fecha:
            dateOnlySchema,
        horaInicio:
            timeSchema
                .nullable(),
        horaFin:
            timeSchema
                .nullable(),
        todoElDia:
            z.boolean({
                message:
                    "Debe indicar si la restricción aplica todo el día",
            }),
        motivo:
            motivoSchema,
    })
    .strict()
    .superRefine(
        (data, ctx) => {
            if (data.todoElDia) {
                if (
                    data.horaInicio !==
                    null
                ) {
                    ctx.addIssue({
                        code:
                            "custom",
                        path: [
                            "horaInicio",
                        ],
                        message:
                            "La hora de inicio debe ser null cuando la restricción aplica todo el día",
                    })
                }
                if (
                    data.horaFin !==
                    null
                ) {
                    ctx.addIssue({
                        code:
                            "custom",
                        path: [
                            "horaFin",
                        ],
                        message:
                            "La hora de fin debe ser null cuando la restricción aplica todo el día",
                    })
                }
                return
            }
            if (!data.horaInicio) {
                ctx.addIssue({
                    code:
                        "custom",
                    path: [
                        "horaInicio",
                    ],
                    message:
                        "La hora de inicio es obligatoria cuando la restricción no aplica todo el día",
                })
            }
            if (!data.horaFin) {
                ctx.addIssue({
                    code:
                        "custom",
                    path: [
                        "horaFin",
                    ],
                    message:
                        "La hora de fin es obligatoria cuando la restricción no aplica todo el día",
                })
            }
            if (
                data.horaInicio &&
                data.horaFin &&
                data.horaInicio >=
                    data.horaFin
            ) {
                ctx.addIssue({
                    code:
                        "custom",
                    path: [
                        "horaFin",
                    ],
                    message:
                        "La hora de fin debe ser mayor que la hora de inicio",
                })
            }
        }
    )

export const createRestriccionHorarioSchema =
    restriccionBaseSchema
export const updateRestriccionHorarioSchema =
    restriccionBaseSchema
export const updateEstadoRestriccionHorarioSchema =
    z
        .object({
            activo: z.boolean({
                message:
                    "El estado activo es obligatorio",
            }),
        })
        .strict()
export type CreateRestriccionHorarioDto =
    z.infer<
        typeof createRestriccionHorarioSchema
    >
export type UpdateRestriccionHorarioDto =
    z.infer<
        typeof updateRestriccionHorarioSchema
    >
export type UpdateEstadoRestriccionHorarioDto =
    z.infer<
        typeof updateEstadoRestriccionHorarioSchema
    >