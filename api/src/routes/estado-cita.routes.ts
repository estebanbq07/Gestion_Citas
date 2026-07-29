import { Router } from "express"
import { asyncHandler } from "../middlewares/async-handler.middleware"
import { EstadoCitaController } from "../controllers/estado-cita.controller"
export class EstadoCitaRoutes {
    static get routes(): Router {
        const router = Router()

        const controller =
            new EstadoCitaController()

        /**
         * @swagger
         * tags:
         *   name: Estados de cita
         *   description: Consulta del catálogo de estados utilizados para controlar el ciclo de vida de las citas.
         */

        /**
         * @swagger
         * components:
         *   schemas:
         *     CitaResumen:
         *       type: object
         *       description: Cita asociada a este estado (solo se incluye al consultar el detalle por ID).
         *       properties:
         *         id:
         *           type: integer
         *           example: 10
         *         clienteId:
         *           type: integer
         *           example: 3
         *         empleadoId:
         *           type: integer
         *           example: 5
         *         servicioId:
         *           type: integer
         *           example: 2
         *         estadoCitaId:
         *           type: integer
         *           example: 1
         *         fecha:
         *           type: string
         *           format: date
         *           example: "2026-07-15"
         *         horaInicio:
         *           type: string
         *           format: time
         *           example: "09:00:00"
         *         horaFin:
         *           type: string
         *           format: time
         *           example: "09:45:00"
         *         costoTotal:
         *           type: number
         *           format: decimal
         *           example: 15000.00
         *
         *     EstadoCita:
         *       type: object
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         nombre:
         *           type: string
         *           maxLength: 50
         *           example: Pendiente
         *         descripcion:
         *           type: string
         *           nullable: true
         *           maxLength: 255
         *           example: La cita fue registrada y está pendiente de confirmación.
         *         bloqueaDisponibilidad:
         *           type: boolean
         *           description: Indica si las citas con este estado ocupan el horario del empleado.
         *           example: true
         *         permiteCancelacionCliente:
         *           type: boolean
         *           description: Indica si una cita con este estado puede ser cancelada por el cliente.
         *           example: true
         *         permiteEdicion:
         *           type: boolean
         *           description: Indica si los datos de una cita con este estado pueden modificarse.
         *           example: true
         *         color:
         *           type: string
         *           nullable: true
         *           maxLength: 30
         *           description: Color o identificador visual utilizado para representar el estado en el FrontEnd.
         *           example: warning
         *         orden:
         *           type: integer
         *           nullable: true
         *           minimum: 1
         *           description: Posición utilizada para ordenar los estados en la interfaz.
         *           example: 1
         *         activo:
         *           type: boolean
         *           description: Indica si el estado está disponible para ser utilizado.
         *           example: true
         *         citas:
         *           type: array
         *           description: Citas registradas con este estado. Solo se incluye en la respuesta de detalle (GET por ID), no en el listado.
         *           items:
         *             $ref: '#/components/schemas/CitaResumen'
         *
         *     EstadoCitaListResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/EstadoCita'
         *
         *     EstadoCitaDetailResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           $ref: '#/components/schemas/EstadoCita'
         *
         *     EstadoCitaErrorResponse:
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
         * /estados-cita:
         *   get:
         *     summary: Listar estados de cita activos
         *     description: >
         *       Retorna únicamente los estados de cita con activo=true, ordenados por el campo
         *       orden (ascendente) y luego por nombre. No incluye las citas asociadas a cada estado.
         *       Los estados se utilizan para controlar disponibilidad, edición, cancelación y
         *       representación visual de las citas.
         *     tags:
         *       - Estados de cita
         *     responses:
         *       200:
         *         description: Lista de estados de cita activos obtenida correctamente
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EstadoCitaListResponse'
         *             example:
         *               success: true
         *               data:
         *                 - id: 1
         *                   nombre: Pendiente
         *                   descripcion: La cita fue registrada y está pendiente de confirmación.
         *                   bloqueaDisponibilidad: true
         *                   permiteCancelacionCliente: true
         *                   permiteEdicion: true
         *                   color: warning
         *                   orden: 1
         *                   activo: true
         *                 - id: 2
         *                   nombre: Confirmada
         *                   descripcion: La cita fue confirmada.
         *                   bloqueaDisponibilidad: true
         *                   permiteCancelacionCliente: true
         *                   permiteEdicion: true
         *                   color: success
         *                   orden: 2
         *                   activo: true
         *       500:
         *         description: Error interno del servidor
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EstadoCitaErrorResponse'
         *             example:
         *               success: false
         *               message: Se produjo un error interno del servidor
         */
        router.get(
            "/",
            asyncHandler(
                controller.listar
            )
        )

        /**
         * @swagger
         * /estados-cita/{id}:
         *   get:
         *     summary: Obtener estado de cita por identificador
         *     description: >
         *       Retorna el detalle de un estado de cita específico, incluyendo las citas
         *       registradas con ese estado. A diferencia del listado, este endpoint no filtra
         *       por activo, por lo que también puede devolver estados inactivos.
         *     tags:
         *       - Estados de cita
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Identificador del estado de cita
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 1
         *     responses:
         *       200:
         *         description: Estado de cita encontrado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EstadoCitaDetailResponse'
         *             example:
         *               success: true
         *               data:
         *                 id: 1
         *                 nombre: Pendiente
         *                 descripcion: La cita fue registrada y está pendiente de confirmación.
         *                 bloqueaDisponibilidad: true
         *                 permiteCancelacionCliente: true
         *                 permiteEdicion: true
         *                 color: warning
         *                 orden: 1
         *                 activo: true
         *                 citas: []
         *       404:
         *         description: Estado de cita no encontrado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EstadoCitaErrorResponse'
         *             example:
         *               success: false
         *               message: El rol no existe
         *       500:
         *         description: Error interno del servidor
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EstadoCitaErrorResponse'
         *             example:
         *               success: false
         *               message: Se produjo un error interno del servidor
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