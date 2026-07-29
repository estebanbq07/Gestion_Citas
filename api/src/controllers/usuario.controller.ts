import {
    Request,
    Response,
    NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";
import { usuarioService } from "../services/usuario.service";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";
import { AuthRequest } from "../middlewares/auth.middleware";
export class UsuarioController {
    listar = async (
        request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const rol =
            typeof request.query.rol ===
                "string"
                ? request.query.rol.trim()
                : undefined;
        const usuarios =
            await usuarioService.listar(
                rol || undefined
            );
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: usuarios,
            });
    };

    obtenerPorId = async (
        request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const id = parseId(
            request.params.id
        );
        const usuario =
            await usuarioService.obtenerPorId(
                id
            );
        if (!usuario) {
            return response
                .status(
                    StatusCodes.NOT_FOUND
                )
                .json({
                    success: false,
                    message:
                        "El usuario no existe",
                });
        }
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: usuario,
            });
    };

    registrarCliente = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const usuario =
                await usuarioService.registrarCliente(
                    request.body
                );
            return sendSuccess(
                response,
                usuario,
                "Cliente registrado correctamente",
                StatusCodes.CREATED
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "";
            if (
                message ===
                "El correo ya está registrado"
            ) {
                return response
                    .status(
                        StatusCodes.CONFLICT
                    )
                    .json({
                        success: false,
                        message,
                    });
            }
            next(error);
        }
    };
    login = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const result =
                await usuarioService.login(
                    request.body
                );
            return sendSuccess(
                response,
                result,
                "Inicio de sesión correcto"
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Credenciales incorrectas";
            if (
                message ===
                "Correo o contraseña incorrectos" ||
                message ===
                "El usuario se encuentra inactivo"
            ) {
                return response
                    .status(
                        StatusCodes.UNAUTHORIZED
                    )
                    .json({
                        success: false,
                        message:
                            "Credenciales incorrectas",
                    });
            }

            next(error);
        }
    };
    actualizar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const id = parseId(
                request.params.id
            );
            const usuario =
                await usuarioService.modificar(
                    id,
                    request.body
                );
            return sendSuccess(
                response,
                usuario,
                "Usuario actualizado correctamente"
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "";
            if (
                message ===
                "El usuario no existe"
            ) {
                return response
                    .status(
                        StatusCodes.NOT_FOUND
                    )
                    .json({
                        success: false,
                        message,
                    });
            }
            if (
                message ===
                "El rol indicado no existe"
            ) {
                return response
                    .status(
                        StatusCodes.BAD_REQUEST
                    )
                    .json({
                        success: false,
                        message,
                    });
            }
            if (
                message ===
                "El correo ya está registrado por otro usuario"
            ) {
                return response
                    .status(
                        StatusCodes.CONFLICT
                    )
                    .json({
                        success: false,
                        message,
                    });
            }
            next(error);
        }
    };

    perfil = async (
        request: AuthRequest,
        response: Response,
        _next: NextFunction
    ) => {
        const usuarioId =
            request.user?.id;
        if (!usuarioId) {
            return response
                .status(
                    StatusCodes.UNAUTHORIZED
                )
                .json({
                    success: false,
                    message:
                        "Usuario no autenticado",
                });
        }
        const usuario =
            await usuarioService.perfil(
                usuarioId
            );
        return sendSuccess(
            response,
            usuario,
            "Perfil obtenido correctamente"
        );
    };
}