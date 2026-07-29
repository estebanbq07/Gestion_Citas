import { z } from "zod";

export const idSchema = z
    .number({ message: "El identificador es obligatorio" })
    .int("El identificador debe ser un número entero")
    .positive("El identificador debe ser válido");

export const optionalBooleanSchema = z.boolean().optional();

export const dateOnlySchema = z
    .string()
    .trim()
    .refine((value) => !isNaN(Date.parse(value)), {
        message: "La fecha debe tener un formato válido",
    });

export const futureOrTodayDateSchema = dateOnlySchema.refine((value) => {
    const input = new Date(value);
    const today = new Date();
    input.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return input >= today;
}, {
    message: "La fecha no puede ser pasada",
});

export const timeSchema = z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: "La hora debe tener formato HH:mm",
    });

export const decimalPositiveSchema = z
    .number({ message: "El monto debe ser numérico" })
    .positive("El monto debe ser mayor a cero")
    .max(99999999.99, "El monto no puede superar 99,999,999.99");

export const uniqueIdsSchema = z
    .array(idSchema)
    .refine((ids) => new Set(ids).size === ids.length, {
        message: "No se permiten identificadores duplicados",
    });
export const emailSchema = z
    .email({
        error: "El correo electrónico no tiene un formato válido",
    })
    .trim()
    .max(150, "El correo no puede superar 150 caracteres");