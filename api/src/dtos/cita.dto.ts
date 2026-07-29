import { z } from "zod"
import {
    decimalPositiveSchema,
    futureOrTodayDateSchema,
    idSchema,
    timeSchema,
    uniqueIdsSchema,
} from "./common.dto"

/**
 * Duración enviada por el FrontEnd.
 *
 * El API valida el dato, pero no lo recalcula.
 */
const duracionMinutosSchema = z
    .number({
        message:
            "La duración es obligatoria y debe ser numérica",
    })
    .int(
        "La duración debe ser un número entero"
    )
    .positive(
        "La duración debe ser mayor a cero"
    )
    .max(
        1440,
        "La duración no puede superar 1440 minutos"
    )

/**
 * Costo de los adicionales.
 *
 * Puede ser cero cuando la cita no tiene adicionales.
 */
const costoAdicionalesSchema = z
    .number({
        message:
            "El costo de adicionales es obligatorio y debe ser numérico",
    })
    .nonnegative(
        "El costo de adicionales debe ser mayor o igual a cero"
    )
    .max(
        99999999.99,
        "El costo de adicionales no puede superar 99,999,999.99"
    )

/**
 * Observaciones opcionales.
 */
const observacionesSchema = z.union([
    z
        .string()
        .trim()
        .min(
            3,
            "Las observaciones deben contener al menos 3 caracteres"
        )
        .max(
            500,
            "Las observaciones no pueden superar 500 caracteres"
        ),
    z.null(),
])

/**
 * Atributos editables comunes entre crear y modificar.
 *
 * El API no recalcula duración ni costos.
 */
const datosEditablesCitaSchema = {
    clienteId: idSchema,
    empleadoId: idSchema,
    servicioId: idSchema,
    fecha:
        futureOrTodayDateSchema,
    horaInicio:
        timeSchema,
    horaFin:
        timeSchema,
    duracionMinutos:
        duracionMinutosSchema,
    precioServicio:
        decimalPositiveSchema,
    costoAdicionales:
        costoAdicionalesSchema,
    costoTotal:
        decimalPositiveSchema,
    observaciones:
        observacionesSchema,
    adicionalIds:
        uniqueIdsSchema,
}

/**
 * Crear una cita.
 *
 * estadoCitaId y creadoPorUsuarioId solamente se reciben
 * durante la creación.
 */
export const createCitaSchema = z
    .object({
        ...datosEditablesCitaSchema,

        estadoCitaId:
            idSchema,

        creadoPorUsuarioId:
            idSchema,
    })
    .strict()
    .refine(
        (data) =>
            data.horaInicio <
            data.horaFin,
        {
            path: ["horaFin"],
            message:
                "La hora de finalización debe ser mayor que la hora de inicio",
        }
    )

/**
 * Modificar completamente una cita.
 *
 * No permite modificar:
 * - estadoCitaId
 * - creadoPorUsuarioId
 * - motivoCancelacion
 */
export const updateCitaSchema = z
    .object({
        ...datosEditablesCitaSchema,
    })
    .strict()
    .refine(
        (data) =>
            data.horaInicio <
            data.horaFin,
        {
            path: ["horaFin"],
            message:
                "La hora de finalización debe ser mayor que la hora de inicio",
        }
    )

/**
 * Cambio de estado.
 */
export const changeEstadoCitaSchema = z
    .object({
        estadoCitaId:
            idSchema,
    })
    .strict()

/**
 * Cancelación de cita.
 *
 * El motivo es obligatorio.
 */
export const cancelarCitaSchema = z
    .object({
        motivoCancelacion: z
            .string({
                message:
                    "El motivo de cancelación es obligatorio",
            })
            .trim()
            .min(
                5,
                "El motivo debe contener al menos 5 caracteres"
            )
            .max(
                255,
                "El motivo no puede superar 255 caracteres"
            ),
    })
    .strict()

/**
 * Consulta de disponibilidad.
 */
export const disponibilidadSchema = z
    .object({
        empleadoId:
            idSchema,
        servicioId:
            idSchema,
        fecha:
            futureOrTodayDateSchema,
        horaInicio:
            timeSchema,
        horaFin:
            timeSchema,
        citaIdExcluir:
            idSchema
                .optional()
                .nullable(),
    })
    .strict()
    .refine(
        (data) =>
            data.horaInicio <
            data.horaFin,
        {
            path: ["horaFin"],
            message:
                "La hora de finalización debe ser mayor que la hora de inicio",
        }
    )

/**
 * Fecha para consultas de agenda.
 */
export const agendaFechaSchema = z
    .object({
        fecha: z
            .string({
                message:
                    "La fecha es obligatoria",
            })
            .trim()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "La fecha debe tener formato YYYY-MM-DD"
            )
            .refine(
                (value) =>
                    !Number.isNaN(
                        Date.parse(
                            `${value}T00:00:00`
                        )
                    ),
                {
                    message:
                        "La fecha no es válida",
                }
            ),
    })
    .strict()

export type CreateCitaDto = z.infer<
    typeof createCitaSchema
>
export type UpdateCitaDto = z.infer<
    typeof updateCitaSchema
>
export type ChangeEstadoCitaDto = z.infer<
    typeof changeEstadoCitaSchema
>
export type CancelarCitaDto = z.infer<
    typeof cancelarCitaSchema
>
export type DisponibilidadDto = z.infer<
    typeof disponibilidadSchema
>