import { Router } from "express";
import { HorarioAtencionController } from "../controllers/horario-atencion.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    createHorarioAtencionSchema,
    updateEstadoHorarioAtencionSchema,
    updateHorarioAtencionSchema,
} from "../dtos/horario-atencion.dto";

export class HorarioAtencionRoutes {
    static get routes(): Router {
        const router =
            Router();
        const controller =
            new HorarioAtencionController();
        /**
         * @swagger
         * tags:
         *   name: Horarios de atención
         *   description: Configuración de los días y rangos de atención del establecimiento.
         */

        /**
         * @swagger
         * components:
         *   schemas:
         *     CrearHorarioAtencionInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - diaSemanaId
         *         - horaInicio
         *         - horaFin
         *       properties:
         *         diaSemanaId:
         *           type: integer
         *           minimum: 1
         *           example: 1
         *         horaInicio:
         *           type: string
         *           pattern: '^([01]\d|2[0-3]):[0-5]\d$'
         *           example: "08:00"
         *         horaFin:
         *           type: string
         *           pattern: '^([01]\d|2[0-3]):[0-5]\d$'
         *           example: "17:00"
         *
         *     ActualizarHorarioAtencionInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - diaSemanaId
         *         - horaInicio
         *         - horaFin
         *       properties:
         *         diaSemanaId:
         *           type: integer
         *           minimum: 1
         *           example: 1
         *         horaInicio:
         *           type: string
         *           example: "09:00"
         *         horaFin:
         *           type: string
         *           example: "18:00"
         *
         *     CambiarEstadoHorarioAtencionInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - activo
         *       properties:
         *         activo:
         *           type: boolean
         *           example: false
         *
         *     HorarioAtencionResponse:
         *       type: object
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         diaSemanaId:
         *           type: integer
         *           example: 1
         *         horaInicio:
         *           type: string
         *           example: "1970-01-01T08:00:00.000Z"
         *         horaFin:
         *           type: string
         *           example: "1970-01-01T17:00:00.000Z"
         *         activo:
         *           type: boolean
         *           example: true
         */

        /**
         * @swagger
         * /horarios-atencion:
         *   get:
         *     summary: Listar horarios de atención
         *     tags: [Horarios de atención]
         *     responses:
         *       200:
         *         description: Lista de horarios
         */
        router.get(
            "/",
            asyncHandler(
                controller.listar
            )
        );

        /**
         * @swagger
         * /horarios-atencion:
         *   post:
         *     summary: Crear horario de atención
         *     description: Crea un horario activo y valida que no se traslape con otro horario del mismo día.
         *     tags: [Horarios de atención]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CrearHorarioAtencionInput'
         *     responses:
         *       201:
         *         description: Horario creado correctamente
         *       400:
         *         description: Datos inválidos
         *       409:
         *         description: Día inexistente o traslape de horarios
         */
        router.post(
            "/",
            validateRequest(
                createHorarioAtencionSchema
            ),
            asyncHandler(
                controller.crear
            )
        );

        /**
         * @swagger
         * /horarios-atencion/{id}/estado:
         *   patch:
         *     summary: Activar o desactivar horario
         *     tags: [Horarios de atención]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CambiarEstadoHorarioAtencionInput'
         *     responses:
         *       200:
         *         description: Estado actualizado
         *       404:
         *         description: Horario no encontrado
         */
        router.patch(
            "/:id/estado",
            validateRequest(
                updateEstadoHorarioAtencionSchema
            ),
            asyncHandler(
                controller.cambiarEstado
            )
        );

        /**
         * @swagger
         * /horarios-atencion/{id}:
         *   put:
         *     summary: Modificar horario de atención
         *     description: Modifica completamente el día y rango horario.
         *     tags: [Horarios de atención]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/ActualizarHorarioAtencionInput'
         *     responses:
         *       200:
         *         description: Horario actualizado
         *       400:
         *         description: Datos inválidos
         *       404:
         *         description: Horario no encontrado
         *       409:
         *         description: Traslape con otro horario
         */
        router.put(
            "/:id",
            validateRequest(
                updateHorarioAtencionSchema
            ),
            asyncHandler(
                controller.actualizar
            )
        );

        /**
         * @swagger
         * /horarios-atencion/{id}:
         *   get:
         *     summary: Obtener horario por ID
         *     tags: [Horarios de atención]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *     responses:
         *       200:
         *         description: Horario encontrado
         *       404:
         *         description: Horario no encontrado
         */
        router.get(
            "/:id",
            asyncHandler(
                controller.obtenerPorId
            )
        );

        return router;
    }
}