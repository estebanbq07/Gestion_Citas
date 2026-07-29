import { Router } from "express";
import { ServicioController } from "../controllers/servicio.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    createServicioSchema,
    updateEstadoServicioSchema,
    updateServicioSchema,
} from "../dtos/servicio.dto";
export class ServicioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller =
            new ServicioController();
        /**
         * @swagger
         * tags:
         *   name: Servicios
         *   description: Gestión de servicios principales ofrecidos por el negocio.
         */
        /**
         * @swagger
         * components:
         *   schemas:
         *     CrearServicioInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - nombre
         *         - descripcion
         *         - precioBase
         *         - duracionMinutos
         *         - especialidadId
         *       properties:
         *         nombre:
         *           type: string
         *           minLength: 3
         *           maxLength: 120
         *           example: Corte de cabello
         *         descripcion:
         *           type: string
         *           minLength: 10
         *           maxLength: 500
         *           example: Servicio profesional de corte de cabello.
         *         precioBase:
         *           type: number
         *           format: double
         *           minimum: 0.01
         *           example: 8000
         *         duracionMinutos:
         *           type: integer
         *           minimum: 15
         *           maximum: 480
         *           example: 45
         *         especialidadId:
         *           type: integer
         *           minimum: 1
         *           example: 1
         *         imagen:
         *           type: string
         *           nullable: true
         *           maxLength: 255
         *           example: servicio-1783628774262.png
         *
         *     ActualizarServicioInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - nombre
         *         - descripcion
         *         - precioBase
         *         - duracionMinutos
         *         - especialidadId
         *         - imagen
         *       properties:
         *         nombre:
         *           type: string
         *           minLength: 3
         *           maxLength: 120
         *           example: Corte de cabello premium
         *         descripcion:
         *           type: string
         *           minLength: 10
         *           maxLength: 500
         *           example: Servicio profesional de corte y asesoría personalizada.
         *         precioBase:
         *           type: number
         *           format: double
         *           minimum: 0.01
         *           example: 9500
         *         duracionMinutos:
         *           type: integer
         *           minimum: 15
         *           maximum: 480
         *           example: 60
         *         especialidadId:
         *           type: integer
         *           minimum: 1
         *           example: 1
         *         imagen:
         *           type: string
         *           nullable: true
         *           maxLength: 255
         *           example: servicio-actualizado.png
         *
         *     CambiarEstadoServicioInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - activo
         *       properties:
         *         activo:
         *           type: boolean
         *           example: false
         *
         *     ServicioResponse:
         *       type: object
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         nombre:
         *           type: string
         *           example: Corte de cabello
         *         descripcion:
         *           type: string
         *           example: Servicio profesional de corte de cabello.
         *         precioBase:
         *           type: string
         *           example: "8000.00"
         *         duracionMinutos:
         *           type: integer
         *           example: 45
         *         imagen:
         *           type: string
         *           nullable: true
         *           example: servicio-1783628774262.png
         *         activo:
         *           type: boolean
         *           example: true
         *         especialidadId:
         *           type: integer
         *           example: 1
         *         creadoEn:
         *           type: string
         *           format: date-time
         *         actualizadoEn:
         *           type: string
         *           format: date-time
         */

        /**
         * @swagger
         * /servicios:
         *   get:
         *     summary: Listar todos los servicios
         *     description: Retorna servicios activos e inactivos para el mantenimiento.
         *     tags: [Servicios]
         *     responses:
         *       200:
         *         description: Lista de servicios
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                   example: true
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/ServicioResponse'
         */
        router.get(
            "/",
            asyncHandler(
                controller.listar
            )
        );

        /**
         * @swagger
         * /servicios/activos:
         *   get:
         *     summary: Listar servicios activos
         *     description: Retorna únicamente los servicios que pueden seleccionarse al registrar una cita.
         *     tags: [Servicios]
         *     responses:
         *       200:
         *         description: Lista de servicios activos
         */
        router.get(
            "/activos",
            asyncHandler(
                controller.listarActivos
            )
        );

        /**
         * @swagger
         * /servicios:
         *   post:
         *     summary: Crear un servicio
         *     description: Crea un servicio activo y guarda el nombre de la imagen previamente subida.
         *     tags: [Servicios]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CrearServicioInput'
         *     responses:
         *       201:
         *         description: Servicio creado correctamente
         *       400:
         *         description: Datos inválidos, especialidad inexistente o inactiva
         *       409:
         *         description: Ya existe un servicio con ese nombre
         */
        router.post(
            "/",
            validateRequest(
                createServicioSchema
            ),
            asyncHandler(
                controller.crear
            )
        );

        /**
         * @swagger
         * /servicios/{id}/estado:
         *   patch:
         *     summary: Activar o desactivar un servicio
         *     description: No permite desactivar servicios con citas pendientes o confirmadas.
         *     tags: [Servicios]
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
         *             $ref: '#/components/schemas/CambiarEstadoServicioInput'
         *     responses:
         *       200:
         *         description: Estado actualizado correctamente
         *       404:
         *         description: El servicio no existe
         *       409:
         *         description: El servicio tiene citas pendientes o confirmadas
         */
        router.patch(
            "/:id/estado",
            validateRequest(
                updateEstadoServicioSchema
            ),
            asyncHandler(
                controller.cambiarEstado
            )
        );

        /**
         * @swagger
         * /servicios/{id}:
         *   put:
         *     summary: Modificar un servicio
         *     description: Modifica completamente los atributos editables. Deben enviarse todos los campos.
         *     tags: [Servicios]
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
         *             $ref: '#/components/schemas/ActualizarServicioInput'
         *     responses:
         *       200:
         *         description: Servicio actualizado correctamente
         *       400:
         *         description: Datos inválidos, especialidad inexistente o inactiva
         *       404:
         *         description: El servicio no existe
         *       409:
         *         description: Ya existe otro servicio con ese nombre
         */
        router.put(
            "/:id",
            validateRequest(
                updateServicioSchema
            ),
            asyncHandler(
                controller.actualizar
            )
        );

        /**
         * @swagger
         * /servicios/{id}:
         *   get:
         *     summary: Obtener un servicio por identificador
         *     tags: [Servicios]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *     responses:
         *       200:
         *         description: Servicio encontrado
         *       404:
         *         description: El servicio no existe
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