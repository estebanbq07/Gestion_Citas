import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { parseId } from "../utils/parse-id";
import { diaSemanaService } from "../services/dia-semana.service";

export class DiaSemanaController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const diaSemanaes = await diaSemanaService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: diaSemanaes,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const diaSemana = await diaSemanaService.obtenerPorId(id);

        if (!diaSemana) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "El día de la semana no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: diaSemana,
        });
    };
}