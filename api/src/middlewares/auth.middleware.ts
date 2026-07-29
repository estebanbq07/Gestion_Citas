import {
    NextFunction,
    Request,
    Response,
} from "express";

import { StatusCodes } from "http-status-codes";

import jwt, {
    JwtPayload,
    Secret,
} from "jsonwebtoken";

export interface AuthTokenPayload
    extends JwtPayload {
    id: number;
    correo: string;
    rol: string;
    empleadoId: number | null;
}

export interface AuthRequest
    extends Request {
    user?: AuthTokenPayload;
}

function obtenerJwtSecret(): Secret {
    const secret =
        process.env.JWT_SECRET;

    if (!secret) {
        throw new Error(
            "La variable de entorno JWT_SECRET no está configurada"
        );
    }

    return secret;
}

export function authenticateToken(
    request: AuthRequest,
    response: Response,
    next: NextFunction
) {
    const authorizationHeader =
        request.headers.authorization;

    if (!authorizationHeader) {
        return response
            .status(
                StatusCodes.UNAUTHORIZED
            )
            .json({
                success: false,
                message:
                    "Token no proporcionado",
            });
    }
    const [scheme, token] =
        authorizationHeader.split(" ");
    if (
        scheme !== "Bearer" ||
        !token
    ) {
        return response
            .status(
                StatusCodes.UNAUTHORIZED
            )
            .json({
                success: false,
                message:
                    "El token debe enviarse con el formato Bearer",
            });
    }

    try {
        const decodedToken =
            jwt.verify(
                token,
                obtenerJwtSecret()
            );
        if (
            typeof decodedToken ===
            "string" ||
            !decodedToken.id ||
            !decodedToken.correo ||
            !decodedToken.rol
        ) {
            return response
                .status(
                    StatusCodes.UNAUTHORIZED
                )
                .json({
                    success: false,
                    message:
                        "Token inválido",
                });
        }
        const empleadoId =
            decodedToken.empleadoId ===
                null ||
                decodedToken.empleadoId ===
                undefined
                ? null
                : Number(
                    decodedToken.empleadoId
                );
        request.user = {
            ...decodedToken,
            id: Number(
                decodedToken.id
            ),
            correo: String(
                decodedToken.correo
            ),
            rol: String(
                decodedToken.rol
            ),
            empleadoId,
        };
        next();
    } catch {
        return response
            .status(
                StatusCodes.UNAUTHORIZED
            )
            .json({
                success: false,
                message:
                    "Token inválido o expirado",
            });
    }
}