import { z } from "zod";

export const createEstadoCitaSchema = z.object({
    nombre: z.string().trim().min(3).max(50),
    descripcion: z.string().trim().max(255).optional().nullable(),
    bloqueaDisponibilidad: z.boolean().optional(),
    permiteCancelacionCliente: z.boolean().optional(),
    permiteEdicion: z.boolean().optional(),
    color: z.string().trim().max(30).optional().nullable(),
    orden: z.number().int().positive().optional().nullable(),
    activo: z.boolean().optional(),
});

export const updateEstadoCitaSchema = createEstadoCitaSchema.partial();

export type CreateEstadoCitaDto = z.infer<typeof createEstadoCitaSchema>;
export type UpdateEstadoCitaDto = z.infer<typeof updateEstadoCitaSchema>;