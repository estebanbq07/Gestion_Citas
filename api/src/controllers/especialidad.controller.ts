import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { parseId } from "../utils/parse-id";
import { especialidadService } from "../services/especialidad.service";

export class EspecialidadController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const Especialidades = await especialidadService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: Especialidades,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const Especialidad = await especialidadService.obtenerPorId(id);

        if (!Especialidad) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "El Especialidad no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: Especialidad,
        });
    };
}