import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { rolService } from "../services/rol.service";
import { parseId } from "../utils/parse-id";

export class RolController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const roles = await rolService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: roles,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);
        const rol = await rolService.obtenerPorId(id);

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