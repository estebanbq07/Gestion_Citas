import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { TipoRestriccionHorarioController } from "../controllers/tipo-restriccion-horario.controller";

export class TipoRestriccionHorarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new TipoRestriccionHorarioController();

        /**
         * @swagger
         * tags:
         *   name: Tipos restriccion horario
         *   description: Consulta del catálogo de tipos de restricción utilizados para bloquear horarios de atención de los empleados (vacaciones, incapacidades, permisos, etc).
         */

        /**
         * @swagger
         * components:
         *   schemas:
         *     TipoRestriccionHorario:
         *       type: object
         *       description: Categoría utilizada para clasificar una restricción de horario de un empleado.
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         nombre:
         *           type: string
         *           maxLength: 80
         *           description: Nombre único del tipo de restricción.
         *           example: Vacaciones
         *         descripcion:
         *           type: string
         *           nullable: true
         *           maxLength: 255
         *           example: Período de vacaciones autorizado del empleado.
         *       required:
         *         - id
         *         - nombre
         *
         *     TipoRestriccionHorarioListResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/TipoRestriccionHorario'
         *
         *     TipoRestriccionHorarioDetailResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           $ref: '#/components/schemas/TipoRestriccionHorario'
         *
         *     TipoRestriccionHorarioErrorResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: false
         *         message:
         *           type: string
         *           example: El rol no existe
         */

        /**
         * @swagger
         * /tipos-restriccion-horario:
         *   get:
         *     summary: Obtener todos los tipos de restricción de horario
         *     description: Retorna el catálogo completo de tipos de restricción de horario disponibles en el sistema.
         *     tags: [Tipos restriccion horario]
         *     responses:
         *       200:
         *         description: Lista de tipos de restricción de horario
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/TipoRestriccionHorarioListResponse'
         *             example:
         *               success: true
         *               data:
         *                 - id: 1
         *                   nombre: Vacaciones
         *                   descripcion: Período de vacaciones autorizado del empleado.
         *                 - id: 2
         *                   nombre: Incapacidad
         *                   descripcion: Incapacidad médica del empleado.
         */
        router.get("/", asyncHandler(controller.listar));
        /**
         * @swagger
         * /tipos-restriccion-horario/{id}:
         *   get:
         *     summary: Obtener tipo de restricción de horario por ID
         *     description: Retorna el detalle de un tipo de restricción de horario específico.
         *     tags: [Tipos restriccion horario]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Identificador del tipo de restricción de horario
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 1
         *     responses:
         *       200:
         *         description: Tipo de Restriccion de Horario encontrado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/TipoRestriccionHorarioDetailResponse'
         *             example:
         *               success: true
         *               data:
         *                 id: 1
         *                 nombre: Vacaciones
         *                 descripcion: Período de vacaciones autorizado del empleado.
         *       404:
         *         description: Tipo de Restriccion de Horario no encontrado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/TipoRestriccionHorarioErrorResponse'
         *             example:
         *               success: false
         *               message: El rol no existe
         */
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}