import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/app-error";
import { logger } from "../config/logger";

export class ErrorMiddleware {
    public static handleError(
        error: unknown,
        req: Request,
        res: Response,
        _next: NextFunction
    ): void {
        const isProduction = process.env.NODE_ENV === "production";
        const errObj = error instanceof Error ? error : new Error(String(error));

        // 1. Manejo de Errores Operacionales Conocidos (AppError)
        if (error instanceof AppError) {
            logger.warn({
                message: error.message,
                name: error.name,
                statusCode: error.statusCode,
                path: req.originalUrl,
                method: req.method,
                validationErrors: error.validationErrors,
            });

            res.status(error.statusCode).json({
                success: false,
                name: error.name,
                message: error.message,
                validationErrors: error.validationErrors,
            });
            return;
        }

        // 2. Manejo de Errores Específicos de Prisma (Validation / Known Errors)
        if (errObj.name === "PrismaClientValidationError") {
            logger.error({
                message: `[PrismaValidationError] ${errObj.message}`,
                name: errObj.name,
                path: req.originalUrl,
                method: req.method,
                stack: errObj.stack,
            });

            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                name: "ValidationError",
                message: "Los datos enviados no cumplen con el formato o tipos requeridos por la base de datos.",
                detail: isProduction ? undefined : {
                    name: errObj.name,
                    message: errObj.message,
                },
            });
            return;
        }

        // 3. Manejo de Errores No Controlados / Inesperados
        logger.error({
            message: `[UnhandledError] ${errObj.message}`,
            name: errObj.name,
            path: req.originalUrl,
            method: req.method,
            stack: errObj.stack,
        });

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            name: "InternalServerError",
            message: "Se produjo un error interno del servidor",
            detail: isProduction ? undefined : {
                name: errObj.name,
                message: errObj.message,
                stack: errObj.stack,
            },
        });
    }
}