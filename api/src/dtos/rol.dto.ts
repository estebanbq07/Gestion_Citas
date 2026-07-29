// src/dtos/rol.dto.ts
import { z } from "zod";

export const createRolSchema = z.object({
    nombre: z.string().trim().min(3).max(50),
    descripcion: z.string().trim().max(255).optional().nullable(),
    activo: z.boolean().optional(),
});

export const updateRolSchema = createRolSchema.partial();

export type CreateRolDto = z.infer<typeof createRolSchema>;
export type UpdateRolDto = z.infer<typeof updateRolSchema>;