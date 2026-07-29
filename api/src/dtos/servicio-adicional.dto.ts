import { z } from "zod";

/**
 * Nombre del servicio adicional.
 */
const nombreServicioAdicionalSchema = z
    .string({
        message: "El nombre es obligatorio",
    })
    .trim()
    .min(
        3,
        "El nombre debe contener al menos 3 caracteres"
    )
    .max(
        120,
        "El nombre no puede superar 120 caracteres"
    );

/**
 * Descripción del servicio adicional.
 */
const descripcionServicioAdicionalSchema = z
    .string({
        message: "La descripción es obligatoria",
    })
    .trim()
    .min(
        10,
        "La descripción debe contener al menos 10 caracteres"
    )
    .max(
        500,
        "La descripción no puede superar 500 caracteres"
    );

/**
 * Precio del servicio adicional.
 */
const precioServicioAdicionalSchema = z
    .number({
        message: "El precio es obligatorio y debe ser numérico",
    })
    .nonnegative(
        "El precio debe ser mayor o igual a cero"
    )
    .max(
        99999999.99,
        "El precio no puede superar 99,999,999.99"
    );

/**
 * Crear un servicio adicional.
 *
 * No recibe activo porque todo adicional nuevo
 * se crea activo automáticamente.
 *
 * No recibe duración porque los adicionales no
 * aumentan la duración de la cita.
 */
export const createServicioAdicionalSchema = z
    .object({
        nombre:
            nombreServicioAdicionalSchema,
        descripcion:
            descripcionServicioAdicionalSchema,
        precio:
            precioServicioAdicionalSchema,
    })
    .strict();

/**
 * Modificar completamente un servicio adicional.
 */
export const updateServicioAdicionalSchema = z
    .object({
        nombre:
            nombreServicioAdicionalSchema,
        descripcion:
            descripcionServicioAdicionalSchema,
        precio:
            precioServicioAdicionalSchema,
    })
    .strict();

/**
 * Activar o desactivar un servicio adicional.
 */
export const updateEstadoServicioAdicionalSchema = z
    .object({
        activo: z.boolean({
            message:
                "El estado activo es obligatorio",
        }),
    })
    .strict();
export type CreateServicioAdicionalDto =
    z.infer<
        typeof createServicioAdicionalSchema
    >;
export type UpdateServicioAdicionalDto =
    z.infer<
        typeof updateServicioAdicionalSchema
    >;
export type UpdateEstadoServicioAdicionalDto =
    z.infer<
        typeof updateEstadoServicioAdicionalSchema
    >;