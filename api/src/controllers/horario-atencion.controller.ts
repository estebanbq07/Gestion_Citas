import {
    Request,
    Response,
    NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";
import { horarioAtencionService } from "../services/horario-atencion.service";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";

export class HorarioAtencionController {
    listar = async (
        _request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const horarios =
            await horarioAtencionService.listar();
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: horarios,
            });
    };
    obtenerPorId = async (
        request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const id =
            parseId(
                request.params.id
            );
        const horario =
            await horarioAtencionService.obtenerPorId(
                id
            );
        if (!horario) {
            return response
                .status(
                    StatusCodes.NOT_FOUND
                )
                .json({
                    success: false,
                    message:
                        "El horario de atención no existe",
                });
        }
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: horario,
            });
    };
    crear = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const horario =
                await horarioAtencionService.crear(
                    request.body
                );
            return sendSuccess(
                response,
                horario,
                "Horario de atención creado correctamente",
                StatusCodes.CREATED
            );
        } catch (error) {
            return this.manejarError(
                error,
                response,
                next
            );
        }
    };
    actualizar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const id =
                parseId(
                    request.params.id
                );
            const horario =
                await horarioAtencionService.modificar(
                    id,
                    request.body
                );
            return sendSuccess(
                response,
                horario,
                "Horario de atención actualizado correctamente"
            );
        } catch (error) {
            return this.manejarError(
                error,
                response,
                next
            );
        }
    };
    cambiarEstado = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const id =
                parseId(
                    request.params.id
                );
            const horario =
                await horarioAtencionService.cambiarEstado(
                    id,
                    request.body
                );
            const message =
                horario.activo
                    ? "Horario de atención activado correctamente"
                    : "Horario de atención desactivado correctamente";
            return sendSuccess(
                response,
                horario,
                message
            );
        } catch (error) {
            return this.manejarError(
                error,
                response,
                next
            );
        }
    };
    private manejarError(
        error: unknown,
        response: Response,
        next: NextFunction
    ) {
        const message =
            error instanceof Error
                ? error.message
                : "";
        if (
            message ===
            "El horario de atención no existe"
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
                "El día de la semana indicado no existe" ||
            message ===
                "El horario se traslapa con otro horario registrado para el mismo día"
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
}