import { z } from "zod";
import { emailSchema, idSchema } from "./common.dto";

const nombrePersonaSchema = z
    .string({
        message: "El valor es obligatorio",
    })
    .trim()
    .min(2, "Debe contener al menos 2 caracteres")
    .max(100, "No puede superar 100 caracteres");

const segundoApellidoSchema = z.union([
    z
        .string()
        .trim()
        .min(2, "El segundo apellido debe contener al menos 2 caracteres")
        .max(100, "El segundo apellido no puede superar 100 caracteres"),
    z.null(),
]);

const telefonoSchema = z.union([
    z
        .string()
        .trim()
        .min(8, "El teléfono debe contener al menos 8 caracteres")
        .max(25, "El teléfono no puede superar 25 caracteres")
        .regex(
            /^[0-9+\-()\s]+$/,
            "El teléfono contiene caracteres no permitidos"
        ),
    z.null(),
]);

const passwordSchema = z
    .string({
        message: "La contraseña es obligatoria",
    })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña no puede superar 100 caracteres")
    .regex(
        /[A-Z]/,
        "La contraseña debe contener al menos una letra mayúscula"
    )
    .regex(
        /[a-z]/,
        "La contraseña debe contener al menos una letra minúscula"
    )
    .regex(
        /[0-9]/,
        "La contraseña debe contener al menos un número"
    );

export const registerClienteSchema = z
    .object({
        nombre: nombrePersonaSchema,

        primerApellido: nombrePersonaSchema,

        segundoApellido: segundoApellidoSchema
            .optional()
            .default(null),

        correo: emailSchema,

        telefono: telefonoSchema
            .optional()
            .default(null),

        password: passwordSchema,
    })
    .strict();

export const loginSchema = z
    .object({
        correo: emailSchema,

        password: z
            .string({
                message: "La contraseña es obligatoria",
            })
            .min(1, "La contraseña es obligatoria")
            .max(100, "La contraseña no puede superar 100 caracteres"),
    })
    .strict();

export const updateUsuarioSchema = z
    .object({
        nombre: nombrePersonaSchema,

        primerApellido: nombrePersonaSchema,

        segundoApellido: segundoApellidoSchema,

        correo: emailSchema,

        telefono: telefonoSchema,

        rolId: idSchema,
    })
    .strict();

export type RegisterClienteDto = z.infer<
    typeof registerClienteSchema
>;

export type LoginDto = z.infer<
    typeof loginSchema
>;

export type UpdateUsuarioDto = z.infer<
    typeof updateUsuarioSchema
>;