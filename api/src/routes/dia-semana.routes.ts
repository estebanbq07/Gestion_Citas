import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { DiaSemanaController } from "../controllers/dia-semana.controller";

export class DiaSemanaRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new DiaSemanaController();

        /**
         * @swagger
         * tags:
         *   name: DiaSemana
         *   description: Consulta de días de la semana.
         */

        /**
         * @swagger
         * components:
         *   schemas:
         *     HorarioAtencion:
         *       type: object
         *       description: Bloque de horario de atención asociado a un día de la semana.
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         diaSemanaId:
         *           type: integer
         *           example: 1
         *         horaInicio:
         *           type: string
         *           format: time
         *           example: "08:00:00"
         *         horaFin:
         *           type: string
         *           format: time
         *           example: "12:00:00"
         *         activo:
         *           type: boolean
         *           default: true
         *     DiaSemana:
         *       type: object
         *       description: Día de la semana utilizado para configurar horarios de atención.
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         nombre:
         *           type: string
         *           maxLength: 30
         *           example: "Lunes"
         *         numeroOrden:
         *           type: integer
         *           description: Orden del día dentro de la semana (único).
         *           example: 1
         *         horarios:
         *           type: array
         *           description: Horarios de atención configurados para este día.
         *           items:
         *             $ref: '#/components/schemas/HorarioAtencion'
         *       required:
         *         - id
         *         - nombre
         *         - numeroOrden
         *     DiaSemanaListResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/DiaSemana'
         *     DiaSemanaResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           $ref: '#/components/schemas/DiaSemana'
         *     DiaSemanaNotFoundResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: false
         *         message:
         *           type: string
         *           example: "El rol no existe"
         */

        /**
         * @swagger
         * /dias-semana:
         *   get:
         *     summary: Obtener todos los días de la semana
         *     description: Devuelve la lista completa de días de la semana ordenados por numeroOrden, incluyendo sus horarios de atención asociados.
         *     tags: [DiaSemana]
         *     responses:
         *       200:
         *         description: Lista de días de la semana
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/DiaSemanaListResponse'
         */
        router.get("/", asyncHandler(controller.listar));

        /**
         * @swagger
         * /dias-semana/{id}:
         *   get:
         *     summary: Obtener día semana por ID
         *     description: Devuelve un día de la semana específico junto con sus horarios de atención asociados.
         *     tags: [DiaSemana]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: ID numérico del día de la semana
         *         example: 1
         *     responses:
         *       200:
         *         description: Día semana encontrado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/DiaSemanaResponse'
         *       404:
         *         description: Día semana no encontrado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/DiaSemanaNotFoundResponse'
         */
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}