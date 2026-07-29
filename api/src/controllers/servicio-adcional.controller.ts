import {
    Request,
    Response,
    NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";
import { servicioAdicionalService } from "../services/servicio-adicional.service";

export class ServicioAdicionalController {
    listar = async (
        _request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const servicios =
            await servicioAdicionalService.listar();
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
            await servicioAdicionalService.listarActivos();
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
            await servicioAdicionalService.obtenerPorId(
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
                        "El servicio adicional no existe",
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
                await servicioAdicionalService.crear(
                    request.body
                );
            return sendSuccess(
                response,
                servicio,
                "Servicio adicional creado correctamente",
                StatusCodes.CREATED
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "";
            if (
                message ===
                "Ya existe un servicio adicional con ese nombre"
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
                await servicioAdicionalService.modificar(
                    id,
                    request.body
                );
            return sendSuccess(
                response,
                servicio,
                "Servicio adicional actualizado correctamente"
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "";
            if (
                message ===
                "El servicio adicional no existe"
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
                "Ya existe otro servicio adicional con ese nombre"
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
                await servicioAdicionalService.cambiarEstado(
                    id,
                    request.body
                );
            const message =
                servicio.activo
                    ? "Servicio adicional activado correctamente"
                    : "Servicio adicional desactivado correctamente";
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
                "El servicio adicional no existe"
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
            next(error);
        }
    };
}