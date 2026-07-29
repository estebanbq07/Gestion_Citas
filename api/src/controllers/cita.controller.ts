import {
    Request,
    Response,
    NextFunction,
} from "express"
import { StatusCodes } from "http-status-codes"
import { citaService } from "../services/cita.service"
import { sendSuccess } from "../utils/http-response"
import { parseId } from "../utils/parse-id"
import { agendaFechaSchema } from "../dtos/cita.dto"

export class CitaController {
    listar = async (
        _request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const citas =
            await citaService.listar()
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: citas,
            })
    }
    listarPorCliente = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const clienteId =
                parseId(
                    request.params
                        .clienteId
                )
            const citas =
                await citaService.listarPorCliente(
                    clienteId
                )
            return response
                .status(
                    StatusCodes.OK
                )
                .json({
                    success: true,
                    data: citas,
                })
        } catch (error) {
            return this.manejarError(
                error,
                response,
                next
            )
        }
    }
    listarPorEmpleado = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const empleadoId =
                parseId(
                    request.params
                        .empleadoId
                )
            const citas =
                await citaService.listarPorEmpleado(
                    empleadoId
                )
            return response
                .status(
                    StatusCodes.OK
                )
                .json({
                    success: true,
                    data: citas,
                })
        } catch (error) {
            return this.manejarError(
                error,
                response,
                next
            )
        }
    }
    obtenerPorId = async (
        request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const id =
            parseId(
                request.params.id
            )
        const cita =
            await citaService.obtenerPorId(
                id
            )
        if (!cita) {
            return response
                .status(
                    StatusCodes.NOT_FOUND
                )
                .json({
                    success: false,
                    message:
                        "La cita no existe",
                })
        }
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: cita,
            })
    }
    crear = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const cita =
                await citaService.crear(
                    request.body
                )
            return sendSuccess(
                response,
                cita,
                "Cita creada correctamente",
                StatusCodes.CREATED
            )
        } catch (error) {
            return this.manejarError(
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
            const id =
                parseId(
                    request.params.id
                )
            const cita =
                await citaService.modificar(
                    id,
                    request.body
                )
            return sendSuccess(
                response,
                cita,
                "Cita actualizada correctamente"
            )
        } catch (error) {
            return this.manejarError(
                error,
                response,
                next
            )
        }
    }
    cancelar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const id =
                parseId(
                    request.params.id
                )
            const cita =
                await citaService.cancelar(
                    id,
                    request.body
                        .motivoCancelacion
                )
            return sendSuccess(
                response,
                cita,
                "Cita cancelada correctamente"
            )
        } catch (error) {
            return this.manejarError(
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
            const id =
                parseId(
                    request.params.id
                )
            const cita =
                await citaService.cambiarEstado(
                    id,
                    request.body
                        .estadoCitaId
                )
            return sendSuccess(
                response,
                cita,
                "Estado de cita actualizado correctamente"
            )
        } catch (error) {
            return this.manejarError(
                error,
                response,
                next
            )
        }
    }
    agendaEmpleado = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const empleadoId =
                parseId(
                    request.params
                        .empleadoId
                )
            const validation =
                agendaFechaSchema.safeParse(
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
                                (
                                    issue
                                ) => ({
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
                await citaService.agendaEmpleado(
                    empleadoId,
                    validation.data
                        .fecha
                )
            return response
                .status(
                    StatusCodes.OK
                )
                .json({
                    success: true,
                    data: agenda,
                })
        } catch (error) {
            return this.manejarError(
                error,
                response,
                next
            )
        }
    }
    agendaDiaria = async (
        request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const validation =
            agendaFechaSchema.safeParse(
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
            await citaService.agendaDiaria(
                validation.data.fecha
            )
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data: agenda,
            })
    }
    disponibilidad = async (
        request: Request,
        response: Response,
        _next: NextFunction
    ) => {
        const disponibilidad =
            await citaService.disponibilidad(
                request.body
            )
        return response
            .status(StatusCodes.OK)
            .json({
                success: true,
                data:
                    disponibilidad,
            })
    }
    private manejarError(
        error: unknown,
        response: Response,
        next: NextFunction
    ) {
        const message =
            error instanceof Error
                ? error.message
                : ""
        const erroresNoEncontrados = [
            "La cita no existe",
            "El cliente no existe",
            "El empleado no existe",
        ]
        if (
            erroresNoEncontrados.includes(
                message
            )
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
        const erroresConflicto = [
            "La cita ya se encuentra cancelada",
            "El horario se traslapa con otra cita",
            "Una cita cancelada no puede cambiarse directamente a Finalizada",
        ]
        if (
            erroresConflicto.includes(
                message
            ) ||
            message.startsWith(
                "No se puede modificar una cita"
            ) ||
            message.startsWith(
                "No se puede cancelar una cita"
            )
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
        const erroresSolicitud = [
            "El cliente indicado no existe",
            "El cliente indicado se encuentra inactivo",
            "El usuario indicado no posee el rol Cliente",
            "El rol Cliente se encuentra inactivo",
            "El usuario creador no existe",
            "El usuario creador se encuentra inactivo",
            "El estado de cita indicado no existe",
            "El estado de cita indicado se encuentra inactivo",
            "No existe el estado Cancelada",
            "El estado Cancelada se encuentra inactivo",
            "El establecimiento no atiende en la fecha seleccionada",
            "El horario solicitado se encuentra fuera del horario de atención",
            "El empleado se encuentra inactivo",
            "El servicio no existe",
            "El servicio se encuentra inactivo",
            "El servicio no está asignado al empleado",
        ]
        if (
            erroresSolicitud.includes(
                message
            ) ||
            message.startsWith(
                "Los siguientes servicios adicionales"
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
        next(error)
    }
}