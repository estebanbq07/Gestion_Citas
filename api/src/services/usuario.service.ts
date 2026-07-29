import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt, {
    Secret,
    SignOptions,
} from "jsonwebtoken";
import {
    LoginDto,
    RegisterClienteDto,
    UpdateUsuarioDto,
} from "../dtos/usuario.dto";

/**
 * Excluye passwordHash 
 */
const usuarioOmit = {
    passwordHash: true,
} as const;

function obtenerJwtSecret(): Secret {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error(
            "La variable de entorno JWT_SECRET no está configurada"
        );
    }
    return secret;
}
export const usuarioService = {
    /**
     * Lista usuarios.
     *
     * Permite filtrar por rol:
     * GET /usuarios?rol=Cliente
     */
    async listar(rol?: string) {
        return await prisma.usuario.findMany({
            where: rol
                ? {
                    rol: {
                        nombre: rol,
                    },
                }
                : undefined,
            omit: usuarioOmit,
            include: {
                rol: true,
                empleado: true,
            },
            orderBy: [
                {
                    nombre: "asc",
                },
                {
                    primerApellido: "asc",
                },
            ],
        });
    },
    /**
     * Consulta un usuario por su identificador.
     */
    async obtenerPorId(id: number) {
        return await prisma.usuario.findUnique({
            where: {
                id,
            },
            omit: usuarioOmit,
            include: {
                rol: true,
                empleado: true,
            },
        });
    },
    /**
     * Consulta interna para iniciar sesión.
     *
     * No utiliza omit porque bcrypt necesita passwordHash.
     */
    async obtenerPorCorreoParaLogin(correo: string) {
        return await prisma.usuario.findUnique({
            where: {
                correo,
            },
            include: {
                rol: true,
                empleado: true,
            },
        });
    },
    /**
     * Registra únicamente un cliente.
     */
    async registrarCliente(
        data: RegisterClienteDto
    ) {
        const correoNormalizado =
            data.correo.toLowerCase();
        const usuarioExiste =
            await prisma.usuario.findUnique({
                where: {
                    correo: correoNormalizado,
                },
                select: {
                    id: true,
                },
            });
        if (usuarioExiste) {
            throw new Error(
                "El correo ya está registrado"
            );
        }
        const rolCliente =
            await prisma.rol.findUnique({
                where: {
                    nombre: "Cliente",
                },
                select: {
                    id: true,
                    activo: true,
                },
            });
        if (!rolCliente) {
            throw new Error(
                "No existe el rol Cliente"
            );
        }
        if (!rolCliente.activo) {
            throw new Error(
                "El rol Cliente se encuentra inactivo"
            );
        }
        const passwordHash =
            await bcrypt.hash(
                data.password,
                10
            );
        return await prisma.usuario.create({
            data: {
                nombre: data.nombre,
                primerApellido:
                    data.primerApellido,
                segundoApellido:
                    data.segundoApellido,
                correo: correoNormalizado,
                telefono: data.telefono,
                passwordHash,
                rolId: rolCliente.id,
                activo: true,
            },
            omit: usuarioOmit,
            include: {
                rol: true,
            },
        });
    },
    /**
     * Inicia sesión y genera el token.
     */
    async login(data: LoginDto) {
        const correoNormalizado =
            data.correo.toLowerCase();
        const usuario =
            await this.obtenerPorCorreoParaLogin(
                correoNormalizado
            );
        if (!usuario) {
            throw new Error(
                "Correo o contraseña incorrectos"
            );
        }
        if (!usuario.activo) {
            throw new Error(
                "El usuario se encuentra inactivo"
            );
        }
        const passwordValido =
            await bcrypt.compare(
                data.password,
                usuario.passwordHash
            );
        if (!passwordValido) {
            throw new Error(
                "Correo o contraseña incorrectos"
            );
        }
        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol.nombre,
            empleadoId:
                usuario.empleado?.id ?? null,
        };
        const options: SignOptions = {
            expiresIn:
                (process.env
                    .JWT_EXPIRES_IN as SignOptions["expiresIn"]) ??
                "2h",
        };
        const token = jwt.sign(
            payload,
            obtenerJwtSecret(),
            options
        );
        return {
            token,
        };
    },
    /**
     * Modifica los datos editables de un usuario.
     */
    async modificar(
        id: number,
        data: UpdateUsuarioDto
    ) {
        const usuarioActual =
            await prisma.usuario.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                },
            });
        if (!usuarioActual) {
            throw new Error(
                "El usuario no existe"
            );
        }
        const rolExiste =
            await prisma.rol.findUnique({
                where: {
                    id: data.rolId,
                },
                select: {
                    id: true,
                },
            });
        if (!rolExiste) {
            throw new Error(
                "El rol indicado no existe"
            );
        }
        const correoNormalizado =
            data.correo.toLowerCase();
        const usuarioConCorreo =
            await prisma.usuario.findUnique({
                where: {
                    correo: correoNormalizado,
                },
                select: {
                    id: true,
                },
            });
        if (
            usuarioConCorreo &&
            usuarioConCorreo.id !== id
        ) {
            throw new Error(
                "El correo ya está registrado por otro usuario"
            );
        }
        return await prisma.usuario.update({
            where: {
                id,
            },
            data: {
                nombre: data.nombre,
                primerApellido:
                    data.primerApellido,
                segundoApellido:
                    data.segundoApellido,
                correo: correoNormalizado,
                telefono: data.telefono,
                rolId: data.rolId,
            },
            omit: usuarioOmit,
            include: {
                rol: true,
                empleado: true,
            },
        });
    },
    /**
     * Obtiene el perfil usando el id almacenado en el token.
     */
    async perfil(usuarioId: number) {
        const usuario =
            await prisma.usuario.findUnique({
                where: {
                    id: usuarioId,
                },
                omit: usuarioOmit,
                include: {
                    rol: true,
                    empleado: true,
                },
            });
        if (!usuario) {
            throw new Error(
                "El usuario no existe"
            );
        }
        return usuario;
    },
};