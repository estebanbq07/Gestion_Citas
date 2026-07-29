import { Router } from "express"
import { RestriccionHorarioController } from "../controllers/restriccion-horario.controller"
import { asyncHandler } from "../middlewares/async-handler.middleware"
import { validateRequest } from "../middlewares/validate-request.middleware"
import {
    createRestriccionHorarioSchema,
    updateEstadoRestriccionHorarioSchema,
    updateRestriccionHorarioSchema,
} from "../dtos/restriccion-horario.dto"

export class RestriccionHorarioRoutes {
    static get routes(): Router {
        const router =
            Router()
        const controller =
            new RestriccionHorarioController()
        /**
         * @swagger
         * tags:
         *   name: Restricciones de horario
         *   description: Gestión de cierres globales y bloqueos específicos de empleados.
         */

        /**
         * @swagger
         * components:
         *   schemas:
         *     CrearRestriccionHorarioInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - tipoRestriccionId
         *         - empleadoId
         *         - fecha
         *         - horaInicio
         *         - horaFin
         *         - todoElDia
         *         - motivo
         *       properties:
         *         tipoRestriccionId:
         *           type: integer
         *           minimum: 1
         *           example: 1
         *         empleadoId:
         *           type: integer
         *           nullable: true
         *           minimum: 1
         *           description: Debe ser null cuando la restricción aplica a todo el establecimiento.
         *           example: 3
         *         fecha:
         *           type: string
         *           format: date
         *           example: "2026-10-12"
         *         horaInicio:
         *           type: string
         *           nullable: true
         *           example: "08:00"
         *         horaFin:
         *           type: string
         *           nullable: true
         *           example: "12:00"
         *         todoElDia:
         *           type: boolean
         *           example: false
         *         motivo:
         *           type: string
         *           minLength: 5
         *           maxLength: 255
         *           example: Capacitación institucional.
         *
         *     ActualizarRestriccionHorarioInput:
         *       allOf:
         *         - $ref: '#/components/schemas/CrearRestriccionHorarioInput'
         *
         *     CambiarEstadoRestriccionHorarioInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - activo
         *       properties:
         *         activo:
         *           type: boolean
         *           example: false
         */

        /**
         * @swagger
         * /restricciones-horario:
         *   get:
         *     summary: Listar restricciones de horario
         *     tags: [Restricciones de horario]
         *     responses:
         *       200:
         *         description: Lista de restricciones
         */
        router.get(
            "/",
            asyncHandler(
                controller.listar
            )
        )

        /**
         * @swagger
         * /restricciones-horario:
         *   post:
         *     summary: Crear restricción de horario
         *     description: >
         *       Crea una restricción global cuando empleadoId es null,
         *       o una restricción individual cuando se envía un empleado.
         *       Si todoElDia es true, horaInicio y horaFin deben ser null.
         *     tags: [Restricciones de horario]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CrearRestriccionHorarioInput'
         *           examples:
         *             restriccionEmpleado:
         *               value:
         *                 tipoRestriccionId: 1
         *                 empleadoId: 3
         *                 fecha: "2026-10-12"
         *                 horaInicio: "08:00"
         *                 horaFin: "12:00"
         *                 todoElDia: false
         *                 motivo: Capacitación institucional.
         *             restriccionGlobal:
         *               value:
         *                 tipoRestriccionId: 2
         *                 empleadoId: null
         *                 fecha: "2026-12-25"
         *                 horaInicio: null
         *                 horaFin: null
         *                 todoElDia: true
         *                 motivo: Cierre por feriado.
         *     responses:
         *       201:
         *         description: Restricción creada
         *       400:
         *         description: Datos o relaciones inválidas
         *       409:
         *         description: Restricción duplicada o traslapada
         */
        router.post(
            "/",
            validateRequest(
                createRestriccionHorarioSchema
            ),
            asyncHandler(
                controller.crear
            )
        )

        /**
         * @swagger
         * /restricciones-horario/{id}/estado:
         *   patch:
         *     summary: Activar o desactivar restricción
         *     tags: [Restricciones de horario]
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
         *             $ref: '#/components/schemas/CambiarEstadoRestriccionHorarioInput'
         *     responses:
         *       200:
         *         description: Estado actualizado
         *       404:
         *         description: Restricción no encontrada
         */
        router.patch(
            "/:id/estado",
            validateRequest(
                updateEstadoRestriccionHorarioSchema
            ),
            asyncHandler(
                controller.cambiarEstado
            )
        )

        /**
         * @swagger
         * /restricciones-horario/{id}:
         *   put:
         *     summary: Modificar restricción
         *     description: Modifica completamente todos los datos editables.
         *     tags: [Restricciones de horario]
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
         *             $ref: '#/components/schemas/ActualizarRestriccionHorarioInput'
         *     responses:
         *       200:
         *         description: Restricción actualizada
         *       400:
         *         description: Datos inválidos
         *       404:
         *         description: Restricción no encontrada
         *       409:
         *         description: Restricción traslapada
         */
        router.put(
            "/:id",
            validateRequest(
                updateRestriccionHorarioSchema
            ),
            asyncHandler(
                controller.actualizar
            )
        )

        /**
         * @swagger
         * /restricciones-horario/{id}:
         *   get:
         *     summary: Obtener restricción por ID
         *     tags: [Restricciones de horario]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *     responses:
         *       200:
         *         description: Restricción encontrada
         *       404:
         *         description: Restricción no encontrada
         */
        router.get(
            "/:id",
            asyncHandler(
                controller.obtenerPorId
            )
        )
        return router
    }
}