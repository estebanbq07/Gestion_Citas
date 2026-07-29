import { z } from "zod"

import {
    idSchema,
    uniqueIdsSchema,
} from "./common.dto"

/**
 * Código interno del empleado.
 *
 * Se aceptan letras, números, guiones y guiones bajos.
 */
const codigoEmpleadoSchema = z
    .string({
        message:
            "El código del empleado es obligatorio",
    })
    .trim()
    .min(
        3,
        "El código debe contener al menos 3 caracteres"
    )
    .max(
        30,
        "El código no puede superar 30 caracteres"
    )
    .regex(
        /^[A-Za-z0-9_-]+$/,
        "El código solo puede contener letras, números, guiones y guiones bajos"
    )

/**
 * Descripción opcional.
 *
 * En modificaciones con PUT debe enviarse la propiedad,
 * aunque puede contener null.
 */
const descripcionEmpleadoSchema = z.union([
    z
        .string()
        .trim()
        .min(
            3,
            "La descripción debe contener al menos 3 caracteres"
        )
        .max(
            500,
            "La descripción no puede superar 500 caracteres"
        ),
    z.null(),
])

/**
 * Servicios que puede atender el empleado.
 *
 * Debe existir al menos uno y no pueden repetirse.
 */
const serviciosEmpleadoSchema =
    uniqueIdsSchema.min(
        1,
        "El empleado debe tener al menos un servicio asignado"
    )

/**
 * Crear empleado.
 *
 * Incluye los servicios desde la creación.
 * Todo empleado nuevo se crea activo.
 */
export const createEmpleadoSchema = z
    .object({
        usuarioId:
            idSchema,
        especialidadId:
            idSchema,
        codigoEmpleado:
            codigoEmpleadoSchema,
        descripcion:
            descripcionEmpleadoSchema
                .optional()
                .default(null),
        servicioIds:
            serviciosEmpleadoSchema,
    })
    .strict()

/**
 * Modificar completamente un empleado.
 *
 * Como se utiliza PUT, todos los atributos editables
 * deben enviarse.
 *
 * servicioIds reemplaza completamente los servicios
 * actuales.
 */
export const updateEmpleadoSchema = z
    .object({
        usuarioId:
            idSchema,
        especialidadId:
            idSchema,
        codigoEmpleado:
            codigoEmpleadoSchema,
        descripcion:
            descripcionEmpleadoSchema,
        servicioIds:
            serviciosEmpleadoSchema,
    })
    .strict()

/**
 * Activar o desactivar empleado.
 */
export const updateEstadoEmpleadoSchema = z
    .object({
        activo: z.boolean({
            message:
                "El estado activo es obligatorio",
        }),
    })
    .strict()

/**
 * Fecha requerida para consultar la agenda.
 */
export const agendaEmpleadoQuerySchema = z
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
export type CreateEmpleadoDto = z.infer<
    typeof createEmpleadoSchema
>
export type UpdateEmpleadoDto = z.infer<
    typeof updateEmpleadoSchema
>
export type UpdateEstadoEmpleadoDto = z.infer<
    typeof updateEstadoEmpleadoSchema
>
export type AgendaEmpleadoQueryDto = z.infer<
    typeof agendaEmpleadoQuerySchema
>