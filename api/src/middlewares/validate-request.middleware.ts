import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/app-error";

type RequestProperty = "body" | "params" | "query";

export function validateRequest(
    schema: ZodSchema,
    property: RequestProperty = "body"
) {
    return (
        request: Request,
        _response: Response,
        next: NextFunction
    ) => {
        const result = schema.safeParse(request[property]);
        if (!result.success) {
            const validationErrors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));
            return next(
                AppError.badRequest(
                    "Datos de entrada inválidos",
                    validationErrors
                )
            );
        }
        if (property === "query") {
            request.query = result.data as Request["query"];
        } else {
            request[property] = result.data;
        }
        next();
    };
}