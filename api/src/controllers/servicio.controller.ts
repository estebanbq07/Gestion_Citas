import {
    Request,
    Response,
    NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";
import { servicioService } from "../services/servicio.service";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";

export class ServicioController {
    listar = async (
        _request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const servicios =
            await servicioService.listar();
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: servicios,
            });
    };
    listarActivos = async (
        _request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const servicios =
            await servicioService.listarActivos();
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: servicios,
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
        const servicio =
            await servicioService.obtenerPorId(
                id
            );
        if (!servicio) {
            return response
                .status(
                    StatusCodes.NOT_FOUND
                )
                .json({
                    success: false,
                    message:
                        "El servicio no existe",
                });
        }

        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: servicio,
            });
    };
    crear = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const servicio =
                await servicioService.crear(
                    request.body
                );
            return sendSuccess(
                response,
                servicio,
                "Servicio creado correctamente",
                StatusCodes.CREATED
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "";
            if (
                message ===
                "Ya existe un servicio con ese nombre"
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
            if (
                message ===
                "La especialidad indicada no existe" ||
                message ===
                "La especialidad indicada se encuentra inactiva"
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
            const servicio =
                await servicioService.modificar(
                    id,
                    request.body
                );
            return sendSuccess(
                response,
                servicio,
                "Servicio actualizado correctamente"
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "";
            if (
                message ===
                "El servicio no existe"
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
                "Ya existe otro servicio con ese nombre"
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
            if (
                message ===
                "La especialidad indicada no existe" ||
                message ===
                "La especialidad indicada se encuentra inactiva"
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
            next(error);
        }
    };

    cambiarEstado = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const id = parseId(
                request.params.id
            );
            const servicio =
                await servicioService.cambiarEstado(
                    id,
                    request.body
                );
            const message =
                servicio.activo
                    ? "Servicio activado correctamente"
                    : "Servicio desactivado correctamente";
            return sendSuccess(
                response,
                servicio,
                message
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "";
            if (
                message ===
                "El servicio no existe"
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
                "No se puede desactivar un servicio con citas pendientes o confirmadas"
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
}