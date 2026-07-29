import { Router } from "express";
import { CitaController } from "../controllers/cita.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

import {
    cancelarCitaSchema,
    changeEstadoCitaSchema,
    createCitaSchema,
    disponibilidadSchema,
    updateCitaSchema,
} from "../dtos/cita.dto";

export class CitaRoutes {
    static get routes(): Router {
        const router =
            Router();
        const controller =
            new CitaController();
        /**
         * @swagger
         * tags:
         *   name: Citas
         *   description: Gestión de citas, disponibilidad, agenda, cancelación y cambio de estado.
         */

        /**
         * @swagger
         * components:
         *   schemas:
         *     CrearCitaInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - clienteId
         *         - empleadoId
         *         - servicioId
         *         - estadoCitaId
         *         - creadoPorUsuarioId
         *         - fecha
         *         - horaInicio
         *         - horaFin
         *         - duracionMinutos
         *         - precioServicio
         *         - costoAdicionales
         *         - costoTotal
         *         - observaciones
         *         - adicionalIds
         *       properties:
         *         clienteId:
         *           type: integer
         *           minimum: 1
         *           example: 8
         *         empleadoId:
         *           type: integer
         *           minimum: 1
         *           example: 3
         *         servicioId:
         *           type: integer
         *           minimum: 1
         *           example: 2
         *         estadoCitaId:
         *           type: integer
         *           minimum: 1
         *           example: 1
         *         creadoPorUsuarioId:
         *           type: integer
         *           minimum: 1
         *           example: 1
         *         fecha:
         *           type: string
         *           format: date
         *           example: "2026-09-18"
         *         horaInicio:
         *           type: string
         *           pattern: '^([01]\d|2[0-3]):[0-5]\d$'
         *           example: "09:00"
         *         horaFin:
         *           type: string
         *           pattern: '^([01]\d|2[0-3]):[0-5]\d$'
         *           example: "10:00"
         *         duracionMinutos:
         *           type: integer
         *           minimum: 1
         *           example: 60
         *         precioServicio:
         *           type: number
         *           minimum: 0.01
         *           example: 12000
         *         costoAdicionales:
         *           type: number
         *           minimum: 0
         *           example: 3000
         *         costoTotal:
         *           type: number
         *           minimum: 0.01
         *           example: 15000
         *         observaciones:
         *           type: string
         *           nullable: true
         *           maxLength: 500
         *           example: Cliente solicita atención puntual.
         *         adicionalIds:
         *           type: array
         *           uniqueItems: true
         *           items:
         *             type: integer
         *             minimum: 1
         *           example: [1, 4]
         *
         *     ActualizarCitaInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - clienteId
         *         - empleadoId
         *         - servicioId
         *         - fecha
         *         - horaInicio
         *         - horaFin
         *         - duracionMinutos
         *         - precioServicio
         *         - costoAdicionales
         *         - costoTotal
         *         - observaciones
         *         - adicionalIds
         *       properties:
         *         clienteId:
         *           type: integer
         *           minimum: 1
         *         empleadoId:
         *           type: integer
         *           minimum: 1
         *         servicioId:
         *           type: integer
         *           minimum: 1
         *         fecha:
         *           type: string
         *           format: date
         *         horaInicio:
         *           type: string
         *           example: "13:00"
         *         horaFin:
         *           type: string
         *           example: "14:30"
         *         duracionMinutos:
         *           type: integer
         *           minimum: 1
         *         precioServicio:
         *           type: number
         *           minimum: 0.01
         *         costoAdicionales:
         *           type: number
         *           minimum: 0
         *         costoTotal:
         *           type: number
         *           minimum: 0.01
         *         observaciones:
         *           type: string
         *           nullable: true
         *         adicionalIds:
         *           type: array
         *           uniqueItems: true
         *           items:
         *             type: integer
         *
         *     CambiarEstadoCitaInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - estadoCitaId
         *       properties:
         *         estadoCitaId:
         *           type: integer
         *           minimum: 1
         *           example: 2
         *
         *     CancelarCitaInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - motivoCancelacion
         *       properties:
         *         motivoCancelacion:
         *           type: string
         *           minLength: 5
         *           maxLength: 255
         *           example: El cliente informó que no podrá asistir.
         *
         *     DisponibilidadCitaInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - empleadoId
         *         - servicioId
         *         - fecha
         *         - horaInicio
         *         - horaFin
         *       properties:
         *         empleadoId:
         *           type: integer
         *           minimum: 1
         *           example: 2
         *         servicioId:
         *           type: integer
         *           minimum: 1
         *           example: 5
         *         fecha:
         *           type: string
         *           format: date
         *           example: "2026-09-18"
         *         horaInicio:
         *           type: string
         *           example: "09:00"
         *         horaFin:
         *           type: string
         *           example: "10:30"
         *         citaIdExcluir:
         *           type: integer
         *           nullable: true
         *           minimum: 1
         *           example: 15
         */

        /**
         * @swagger
         * /citas:
         *   get:
         *     summary: Listar todas las citas
         *     tags: [Citas]
         *     responses:
         *       200:
         *         description: Lista de citas
         */
        router.get(
            "/",
            asyncHandler(
                controller.listar
            )
        );

        /**
         * @swagger
         * /citas/cliente/{clienteId}:
         *   get:
         *     summary: Listar citas de un cliente
         *     tags: [Citas]
         *     parameters:
         *       - in: path
         *         name: clienteId
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 8
         *     responses:
         *       200:
         *         description: Citas del cliente
         *       404:
         *         description: El cliente no existe
         */
        router.get(
            "/cliente/:clienteId",
            asyncHandler(
                controller.listarPorCliente
            )
        );

        /**
         * @swagger
         * /citas/empleado/{empleadoId}:
         *   get:
         *     summary: Listar citas de un empleado
         *     tags: [Citas]
         *     parameters:
         *       - in: path
         *         name: empleadoId
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 3
         *     responses:
         *       200:
         *         description: Citas del empleado
         *       404:
         *         description: El empleado no existe
         */
        router.get(
            "/empleado/:empleadoId",
            asyncHandler(
                controller.listarPorEmpleado
            )
        );

        /**
         * @swagger
         * /citas/agenda-empleado/{empleadoId}:
         *   get:
         *     summary: Consultar agenda de un empleado
         *     tags: [Citas]
         *     parameters:
         *       - in: path
         *         name: empleadoId
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *       - in: query
         *         name: fecha
         *         required: true
         *         schema:
         *           type: string
         *           format: date
         *         example: "2026-09-18"
         *     responses:
         *       200:
         *         description: Agenda del empleado
         *       400:
         *         description: Fecha inválida
         *       404:
         *         description: El empleado no existe
         */
        router.get(
            "/agenda-empleado/:empleadoId",
            asyncHandler(
                controller.agendaEmpleado
            )
        );

        /**
         * @swagger
         * /citas/agenda-diaria:
         *   get:
         *     summary: Consultar agenda diaria
         *     tags: [Citas]
         *     parameters:
         *       - in: query
         *         name: fecha
         *         required: true
         *         schema:
         *           type: string
         *           format: date
         *         example: "2026-09-18"
         *     responses:
         *       200:
         *         description: Agenda diaria
         *       400:
         *         description: Fecha inválida
         */
        router.get(
            "/agenda-diaria",
            asyncHandler(
                controller.agendaDiaria
            )
        );

        /**
         * @swagger
         * /citas/disponibilidad:
         *   post:
         *     summary: Consultar disponibilidad
         *     description: Valida empleado, servicio, horario de atención, restricciones y traslapes.
         *     tags: [Citas]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/DisponibilidadCitaInput'
         *     responses:
         *       200:
         *         description: Resultado de disponibilidad
         *       400:
         *         description: Datos inválidos
         */
        router.post(
            "/disponibilidad",
            validateRequest(
                disponibilidadSchema
            ),
            asyncHandler(
                controller.disponibilidad
            )
        );

        /**
         * @swagger
         * /citas:
         *   post:
         *     summary: Crear cita
         *     description: Guarda la duración y los costos enviados sin recalcularlos.
         *     tags: [Citas]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CrearCitaInput'
         *     responses:
         *       201:
         *         description: Cita creada correctamente
         *       400:
         *         description: Datos o relaciones inválidas
         *       409:
         *         description: Conflicto de disponibilidad
         */
        router.post(
            "/",
            validateRequest(
                createCitaSchema
            ),
            asyncHandler(
                controller.crear
            )
        );

        /**
         * @swagger
         * /citas/{id}/cancelar:
         *   patch:
         *     summary: Cancelar cita
         *     tags: [Citas]
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
         *             $ref: '#/components/schemas/CancelarCitaInput'
         *     responses:
         *       200:
         *         description: Cita cancelada correctamente
         *       404:
         *         description: La cita no existe
         *       409:
         *         description: El estado actual no permite cancelar
         */
        router.patch(
            "/:id/cancelar",
            validateRequest(
                cancelarCitaSchema
            ),
            asyncHandler(
                controller.cancelar
            )
        );

        /**
         * @swagger
         * /citas/{id}/estado:
         *   patch:
         *     summary: Cambiar estado de cita
         *     tags: [Citas]
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
         *             $ref: '#/components/schemas/CambiarEstadoCitaInput'
         *     responses:
         *       200:
         *         description: Estado actualizado
         *       400:
         *         description: Estado inexistente o inactivo
         *       404:
         *         description: La cita no existe
         *       409:
         *         description: Transición de estado no permitida
         */
        router.patch(
            "/:id/estado",
            validateRequest(
                changeEstadoCitaSchema
            ),
            asyncHandler(
                controller.cambiarEstado
            )
        );

        /**
         * @swagger
         * /citas/{id}:
         *   put:
         *     summary: Modificar cita
         *     description: Modifica todos los datos editables y guarda los costos enviados sin recalcular.
         *     tags: [Citas]
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
         *             $ref: '#/components/schemas/ActualizarCitaInput'
         *     responses:
         *       200:
         *         description: Cita actualizada
         *       400:
         *         description: Datos inválidos
         *       404:
         *         description: La cita no existe
         *       409:
         *         description: La cita no permite edición o existe conflicto de horario
         */
        router.put(
            "/:id",
            validateRequest(
                updateCitaSchema
            ),
            asyncHandler(
                controller.actualizar
            )
        );

        /**
         * @swagger
         * /citas/{id}:
         *   get:
         *     summary: Obtener cita por identificador
         *     tags: [Citas]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *     responses:
         *       200:
         *         description: Cita encontrada
         *       404:
         *         description: La cita no existe
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