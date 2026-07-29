import { z } from "zod";

export const createTipoRestriccionHorarioSchema = z.object({
    nombre: z.string().trim().min(3).max(80),
    descripcion: z.string().trim().max(255).optional().nullable(),
});

export const updateTipoRestriccionHorarioSchema =
    createTipoRestriccionHorarioSchema.partial();

export type CreateTipoRestriccionHorarioDto =
    z.infer<typeof createTipoRestriccionHorarioSchema>;

export type UpdateTipoRestriccionHorarioDto =
    z.infer<typeof updateTipoRestriccionHorarioSchema>;