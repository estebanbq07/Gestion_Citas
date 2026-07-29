import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { parseId } from "../utils/parse-id";
import { estadoCitaService } from "../services/estado-cita.service";

export class EstadoCitaController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const roles = await estadoCitaService .listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: roles,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const rol = await estadoCitaService .obtenerPorId(id);

        if (!rol) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "El rol no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: rol,
        });
    };
}