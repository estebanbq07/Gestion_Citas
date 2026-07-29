import { z } from "zod";
import {
    decimalPositiveSchema,
    idSchema,
} from "./common.dto";

/**
 * Nombre del servicio.
 */
const nombreServicioSchema = z
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
 * Descripción del servicio.
 */
const descripcionServicioSchema = z
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
 * Duración expresada en minutos.
 */
const duracionMinutosSchema = z
    .number({
        message: "La duración es obligatoria",
    })
    .int(
        "La duración debe ser un número entero"
    )
    .positive(
        "La duración debe ser mayor a cero"
    )
    .min(
        15,
        "La duración mínima es de 15 minutos"
    )
    .max(
        480,
        "La duración no puede superar 8 horas"
    );

/**
 * Nombre del archivo de imagen.
 *
 * Se guarda únicamente el nombre generado por el API,
 * no una URL completa.
 */
const imagenSchema = z.union([
    z
        .string()
        .trim()
        .min(
            1,
            "El nombre de la imagen no puede estar vacío"
        )
        .max(
            255,
            "El nombre de la imagen no puede superar 255 caracteres"
        )
        .regex(
            /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i,
            "El nombre de la imagen debe corresponder a un archivo JPG, PNG o WEBP"
        ),
    z.null(),
]);

/**
 * Crear un servicio.

 */
export const createServicioSchema = z
    .object({
        nombre: nombreServicioSchema,
        descripcion:
            descripcionServicioSchema,
        precioBase:
            decimalPositiveSchema,
        duracionMinutos:
            duracionMinutosSchema,
        especialidadId:
            idSchema,
        imagen: imagenSchema
            .optional()
            .default(null),
    })
    .strict();

/**
 * Modificar completamente un servicio.
 */
export const updateServicioSchema = z
    .object({
        nombre: nombreServicioSchema,
        descripcion:
            descripcionServicioSchema,
        precioBase:
            decimalPositiveSchema,
        duracionMinutos:
            duracionMinutosSchema,
        especialidadId:
            idSchema,
        imagen:
            imagenSchema,
    })
    .strict();

/**
 * Activar o desactivar un servicio.
 */
export const updateEstadoServicioSchema = z
    .object({
        activo: z.boolean({
            message:
                "El estado activo es obligatorio",
        }),
    })
    .strict();

export type CreateServicioDto = z.infer<
    typeof createServicioSchema
>;
export type UpdateServicioDto = z.infer<
    typeof updateServicioSchema
>;
export type UpdateEstadoServicioDto = z.infer<
    typeof updateEstadoServicioSchema
>;