import { EstadoOrden, Role } from "../../generated/prisma";

export interface EnumOption {
    value: string;
    label: string;
}

//Estado de las Órdenes
export const EstadoOrdenMap: Record<EstadoOrden, string> = {
    [EstadoOrden.PENDIENTE]: "Pendiente de Pago",
    [EstadoOrden.PAGADA]: "Pagada",
    [EstadoOrden.ENVIADA]: "Enviada",
    [EstadoOrden.CANCELADA]: "Cancelada"
};

// Roles
export const RoleMap: Record<Role, string> = {
    [Role.USER]: "Cliente",
    [Role.ADMIN]: "Administrador"
};

/**
 * Convierte un diccionario de mapas en un array de opciones
 */
export function getEnumOptions<T extends string>(map: Record<T, string>): EnumOption[] {
    return Object.entries(map).map(([value, label]) => ({
        value,
        label: label as string
    }));
}