import { z } from "zod";

export const createDiaSemanaSchema = z.object({
    nombre: z.string().trim().min(4).max(30),
    numeroOrden: z
        .number({ message: "El número de día es obligatorio" })
        .int("El número de día debe ser entero")
        .min(1, "El número de día debe estar entre 1 y 7")
        .max(7, "El número de día debe estar entre 1 y 7"),
});

export const updateDiaSemanaSchema = createDiaSemanaSchema.partial();

export type CreateDiaSemanaDto = z.infer<typeof createDiaSemanaSchema>;
export type UpdateDiaSemanaDto = z.infer<typeof updateDiaSemanaSchema>;