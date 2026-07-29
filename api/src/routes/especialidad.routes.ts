import { Router } from "express"
import { asyncHandler } from "../middlewares/async-handler.middleware"
import { EspecialidadController } from "../controllers/especialidad.controller"

export class EspecialidadRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new EspecialidadController()

        /**
         * @swagger
         * tags:
         *   name: Especialidades
         *   description: Consulta de especialidades del sistema.
         */

        /**
         * @swagger
         * components:
         *   schemas:
         *     UsuarioResumen:
         *       type: object
         *       description: Datos del usuario asociado a un empleado.
         *       properties:
         *         id:
         *           type: integer
         *           example: 3
         *         nombre:
         *           type: string
         *           example: "María"
         *         primerApellido:
         *           type: string
         *           example: "Gómez"
         *         segundoApellido:
         *           type: string
         *           nullable: true
         *           example: "Rojas"
         *         correo:
         *           type: string
         *           format: email
         *           example: "maria.gomez@example.com"
         *         telefono:
         *           type: string
         *           nullable: true
         *           example: "8888-8888"
         *         activo:
         *           type: boolean
         *           default: true
         *     EmpleadoResumen:
         *       type: object
         *       description: Empleado que posee esta especialidad.
         *       properties:
         *         id:
         *           type: integer
         *           example: 5
         *         usuarioId:
         *           type: integer
         *           example: 3
         *         especialidadId:
         *           type: integer
         *           example: 1
         *         codigoEmpleado:
         *           type: string
         *           example: "EMP-001"
         *         descripcion:
         *           type: string
         *           nullable: true
         *           example: "Especialista senior"
         *         activo:
         *           type: boolean
         *           default: true
         *         usuario:
         *           $ref: '#/components/schemas/UsuarioResumen'
         *     ServicioResumen:
         *       type: object
         *       description: Servicio ofrecido dentro de esta especialidad.
         *       properties:
         *         id:
         *           type: integer
         *           example: 2
         *         nombre:
         *           type: string
         *           maxLength: 120
         *           example: "Corte de cabello"
         *         descripcion:
         *           type: string
         *           maxLength: 500
         *           example: "Corte y peinado profesional"
         *         precioBase:
         *           type: number
         *           format: decimal
         *           example: 15000.00
         *         duracionMinutos:
         *           type: integer
         *           example: 45
         *         imagen:
         *           type: string
         *           nullable: true
         *           example: "https://example.com/imagen.jpg"
         *         activo:
         *           type: boolean
         *           default: true
         *     Especialidad:
         *       type: object
         *       description: Especialidad médica u ocupacional del sistema, agrupa servicios y empleados.
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         nombre:
         *           type: string
         *           maxLength: 100
         *           example: "Peluquería"
         *         descripcion:
         *           type: string
         *           nullable: true
         *           maxLength: 255
         *           example: "Servicios relacionados con el cuidado del cabello"
         *         activo:
         *           type: boolean
         *           default: true
         *         servicios:
         *           type: array
         *           description: Servicios asociados a la especialidad.
         *           items:
         *             $ref: '#/components/schemas/ServicioResumen'
         *         empleados:
         *           type: array
         *           description: Empleados que tienen esta especialidad.
         *           items:
         *             $ref: '#/components/schemas/EmpleadoResumen'
         *       required:
         *         - id
         *         - nombre
         *     EspecialidadListResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/Especialidad'
         *     EspecialidadResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           $ref: '#/components/schemas/Especialidad'
         *     EspecialidadNotFoundResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: false
         *         message:
         *           type: string
         *           example: "El Especialidad no existe"
         */

        /**
         * @swagger
         * /especialidades:
         *   get:
         *     summary: Obtener todas las especialidades
         *     description: Devuelve la lista completa de especialidades ordenadas alfabéticamente, incluyendo sus servicios y empleados (con datos de usuario) asociados.
         *     tags: [Especialidades]
         *     responses:
         *       200:
         *         description: Lista de especialidades
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EspecialidadListResponse'
         */
        router.get("/", asyncHandler(controller.listar))

        /**
         * @swagger
         * /especialidades/{id}:
         *   get:
         *     summary: Obtener especialidad por ID
         *     description: Devuelve una especialidad específica junto con sus servicios y empleados (con datos de usuario) asociados.
         *     tags: [Especialidades]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         description: ID numérico de la especialidad
         *         example: 1
         *     responses:
         *       200:
         *         description: Especialidad encontrada
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EspecialidadResponse'
         *       404:
         *         description: Especialidad no encontrada
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EspecialidadNotFoundResponse'
         */
        router.get("/:id", asyncHandler(controller.obtenerPorId))

        return router
    }
}