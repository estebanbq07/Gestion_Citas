import {
    Request,
    Response,
    NextFunction,
} from "express";
import { StatusCodes } from "http-status-codes";
import { restriccionHorarioService } from "../services/restriccion-horario.service";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";

export class RestriccionHorarioController {
    listar = async (
        _request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const restricciones =
            await restriccionHorarioService.listar();
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: restricciones,
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
        const restriccion =
            await restriccionHorarioService.obtenerPorId(
                id
            );
        if (!restriccion) {
            return response
                .status(
                    StatusCodes.NOT_FOUND
                )
                .json({
                    success: false,
                    message:
                        "La restricción de horario no existe",
                });
        }
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: restriccion,
            });
    };
    crear = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const restriccion =
                await restriccionHorarioService.crear(
                    request.body
                );
            return sendSuccess(
                response,
                restriccion,
                "Restricción de horario creada correctamente",
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
            const restriccion =
                await restriccionHorarioService.modificar(
                    id,
                    request.body
                );
            return sendSuccess(
                response,
                restriccion,
                "Restricción de horario actualizada correctamente"
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
            const restriccion =
                await restriccionHorarioService.cambiarEstado(
                    id,
                    request.body
                );
            const message =
                restriccion.activo
                    ? "Restricción de horario activada correctamente"
                    : "Restricción de horario desactivada correctamente";
            return sendSuccess(
                response,
                restriccion,
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
            "La restricción de horario no existe"
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
            "El tipo de restricción indicado no existe" ||
            message ===
            "El empleado indicado no existe" ||
            message ===
            "El empleado indicado se encuentra inactivo"
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
            "La restricción se traslapa con otra restricción registrada"
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