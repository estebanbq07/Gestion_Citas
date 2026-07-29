import {
    Request,
    Response,
    NextFunction,
} from "express"
import { StatusCodes } from "http-status-codes"
import { empleadoService } from "../services/empleado.service"
import { sendSuccess } from "../utils/http-response"
import { parseId } from "../utils/parse-id"
import { agendaEmpleadoQuerySchema } from "../dtos/empleado.dto"

export class EmpleadoController {
    listar = async (
        _request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const empleados =
            await empleadoService.listar()
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: empleados,
            })
    }
    listarActivos = async (
        request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const servicioId =
            typeof request.query
                .servicioId === "string"
                ? Number(
                    request.query
                        .servicioId
                )
                : undefined
        if (
            servicioId !== undefined &&
            (!Number.isInteger(
                servicioId
            ) ||
                servicioId <= 0)
        ) {
            return response
                .status(
                    StatusCodes.BAD_REQUEST
                )
                .json({
                    success: false,
                    message:
                        "El identificador del servicio no es válido",
                })
        }
        const empleados =
            await empleadoService.listarActivos(
                servicioId
            )
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: empleados,
            })
    }
    obtenerPorId = async (
        request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const id = parseId(
            request.params.id
        )
        const empleado =
            await empleadoService.obtenerPorId(
                id
            )
        if (!empleado) {
            return response
                .status(
                    StatusCodes.NOT_FOUND
                )
                .json({
                    success: false,
                    message:
                        "El empleado no existe",
                })
        }
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: empleado,
            })
    }
    crear = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const empleado =
                await empleadoService.crear(
                    request.body
                )
            return sendSuccess(
                response,
                empleado,
                "Empleado creado correctamente",
                StatusCodes.CREATED
            )
        } catch (error) {
            return this.manejarErrorNegocio(
                error,
                response,
                next
            )
        }
    }
    actualizar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const id = parseId(
                request.params.id
            )
            const empleado =
                await empleadoService.modificar(
                    id,
                    request.body
                )
            return sendSuccess(
                response,
                empleado,
                "Empleado actualizado correctamente"
            )
        } catch (error) {
            return this.manejarErrorNegocio(
                error,
                response,
                next
            )
        }
    }
    cambiarEstado = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const id = parseId(
                request.params.id
            )
            const empleado =
                await empleadoService.cambiarEstado(
                    id,
                    request.body
                )
            const message =
                empleado.activo
                    ? "Empleado activado correctamente"
                    : "Empleado desactivado correctamente"
            return sendSuccess(
                response,
                empleado,
                message
            )
        } catch (error) {
            return this.manejarErrorNegocio(
                error,
                response,
                next
            )
        }
    }
    agenda = async (
        request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const id = parseId(
            request.params.id
        )
        const validation =
            agendaEmpleadoQuerySchema.safeParse(
                request.query
            )
        if (!validation.success) {
            return response
                .status(
                    StatusCodes.BAD_REQUEST
                )
                .json({
                    success: false,
                    message:
                        "Datos de consulta inválidos",
                    validationErrors:
                        validation.error.issues.map(
                            (issue) => ({
                                field:
                                    issue.path.join(
                                        "."
                                    ),
                                message:
                                    issue.message,
                            })
                        ),
                })
        }
        const agenda =
            await empleadoService.agenda(
                id,
                validation.data.fecha
            )
        if (!agenda) {
            return response
                .status(
                    StatusCodes.NOT_FOUND
                )
                .json({
                    success: false,
                    message:
                        "El empleado no existe",
                })
        }
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: agenda,
            })
    }

    /**
     * Convierte errores conocidos del servicio en respuestas HTTP.
     */
    private manejarErrorNegocio(
        error: unknown,
        response: Response,
        next: NextFunction
    ) {
        const message =
            error instanceof Error
                ? error.message
                : ""
        if (
            message ===
            "El empleado no existe"
        ) {
            return response
                .status(
                    StatusCodes.NOT_FOUND
                )
                .json({
                    success: false,
                    message,
                })
        }
        if (
            message ===
            "El usuario ya está asociado a otro empleado" ||
            message ===
            "El código de empleado ya está registrado"
        ) {
            return response
                .status(
                    StatusCodes.CONFLICT
                )
                .json({
                    success: false,
                    message,
                })
        }
        if (
            message ===
            "El usuario indicado no existe" ||
            message ===
            "El usuario indicado se encuentra inactivo" ||
            message ===
            "La especialidad indicada no existe" ||
            message ===
            "La especialidad indicada se encuentra inactiva" ||
            message.startsWith(
                "Los siguientes servicios no existen:"
            ) ||
            message.startsWith(
                "Los siguientes servicios están inactivos:"
            ) ||
            message.startsWith(
                "Los siguientes servicios no pertenecen"
            )
        ) {
            return response
                .status(
                    StatusCodes.BAD_REQUEST
                )
                .json({
                    success: false,
                    message,
                })
        }
        if (
            message ===
            "No se puede desactivar un empleado con citas pendientes o confirmadas"
        ) {
            return response
                .status(
                    StatusCodes.CONFLICT
                )
                .json({
                    success: false,
                    message,
                })
        }
        next(error)
    }
}