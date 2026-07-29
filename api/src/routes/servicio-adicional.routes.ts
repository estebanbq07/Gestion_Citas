import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    createServicioAdicionalSchema,
    updateEstadoServicioAdicionalSchema,
    updateServicioAdicionalSchema,
} from "../dtos/servicio-adicional.dto";
import { ServicioAdicionalController } from "../controllers/servicio-adcional.controller";


export class ServicioAdicionalRoutes {
    static get routes(): Router {
        const router = Router();

        const controller =
            new ServicioAdicionalController();

        /**
         * @swagger
         * tags:
         *   name: Servicios Adicionales
         *   description: Gestión de servicios adicionales que aumentan el costo de una cita, pero no su duración.
         */

        /**
         * @swagger
         * components:
         *   schemas:
         *     CrearServicioAdicionalInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - nombre
         *         - descripcion
         *         - precio
         *       properties:
         *         nombre:
         *           type: string
         *           minLength: 3
         *           maxLength: 120
         *           example: Lavado especial
         *         descripcion:
         *           type: string
         *           minLength: 10
         *           maxLength: 500
         *           example: Servicio adicional de lavado especial.
         *         precio:
         *           type: number
         *           format: double
         *           minimum: 0
         *           example: 3000
         *
         *     ActualizarServicioAdicionalInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - nombre
         *         - descripcion
         *         - precio
         *       properties:
         *         nombre:
         *           type: string
         *           minLength: 3
         *           maxLength: 120
         *           example: Lavado premium
         *         descripcion:
         *           type: string
         *           minLength: 10
         *           maxLength: 500
         *           example: Servicio adicional de lavado premium.
         *         precio:
         *           type: number
         *           format: double
         *           minimum: 0
         *           example: 4500
         *
         *     CambiarEstadoServicioAdicionalInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - activo
         *       properties:
         *         activo:
         *           type: boolean
         *           example: false
         *
         *     ServicioAdicionalResponse:
         *       type: object
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         nombre:
         *           type: string
         *           example: Lavado especial
         *         descripcion:
         *           type: string
         *           example: Servicio adicional de lavado especial.
         *         precio:
         *           type: string
         *           example: "3000.00"
         *         activo:
         *           type: boolean
         *           example: true
         *         creadoEn:
         *           type: string
         *           format: date-time
         *         actualizadoEn:
         *           type: string
         *           format: date-time
         */

        /**
         * @swagger
         * /servicios-adicionales:
         *   get:
         *     summary: Listar todos los servicios adicionales
         *     description: Retorna adicionales activos e inactivos para el mantenimiento.
         *     tags: [Servicios Adicionales]
         *     responses:
         *       200:
         *         description: Lista de servicios adicionales
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
         *                     $ref: '#/components/schemas/ServicioAdicionalResponse'
         */
        router.get(
            "/",
            asyncHandler(
                controller.listar
            )
        );

        /**
         * @swagger
         * /servicios-adicionales/activos:
         *   get:
         *     summary: Listar servicios adicionales activos
         *     description: Retorna únicamente los adicionales disponibles para registrar una cita.
         *     tags: [Servicios Adicionales]
         *     responses:
         *       200:
         *         description: Lista de adicionales activos
         */
        router.get(
            "/activos",
            asyncHandler(
                controller.listarActivos
            )
        );

        /**
         * @swagger
         * /servicios-adicionales:
         *   post:
         *     summary: Crear un servicio adicional
         *     description: Crea un adicional activo. El adicional aumenta el costo de la cita.
         *     tags: [Servicios Adicionales]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CrearServicioAdicionalInput'
         *           example:
         *             nombre: Lavado especial
         *             descripcion: Servicio adicional de lavado especial.
         *             precio: 3000
         *     responses:
         *       201:
         *         description: Servicio adicional creado correctamente
         *       400:
         *         description: Datos inválidos
         *       409:
         *         description: Ya existe un adicional con ese nombre
         */
        router.post(
            "/",
            validateRequest(
                createServicioAdicionalSchema
            ),
            asyncHandler(
                controller.crear
            )
        );

        /**
         * @swagger
         * /servicios-adicionales/{id}/estado:
         *   patch:
         *     summary: Activar o desactivar un servicio adicional
         *     description: Al desactivarlo, deja de estar disponible para nuevas citas, pero permanece en el historial.
         *     tags: [Servicios Adicionales]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 1
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CambiarEstadoServicioAdicionalInput'
         *     responses:
         *       200:
         *         description: Estado actualizado correctamente
         *       400:
         *         description: Estado inválido
         *       404:
         *         description: Servicio adicional no encontrado
         */
        router.patch(
            "/:id/estado",
            validateRequest(
                updateEstadoServicioAdicionalSchema
            ),
            asyncHandler(
                controller.cambiarEstado
            )
        );

        /**
         * @swagger
         * /servicios-adicionales/{id}:
         *   put:
         *     summary: Modificar un servicio adicional
         *     description: Modifica completamente el nombre, descripción y precio. Deben enviarse todos los campos.
         *     tags: [Servicios Adicionales]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 1
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/ActualizarServicioAdicionalInput'
         *           example:
         *             nombre: Lavado premium
         *             descripcion: Servicio adicional de lavado premium.
         *             precio: 4500
         *     responses:
         *       200:
         *         description: Servicio adicional actualizado correctamente
         *       400:
         *         description: Datos inválidos
         *       404:
         *         description: Servicio adicional no encontrado
         *       409:
         *         description: Ya existe otro adicional con ese nombre
         */
        router.put(
            "/:id",
            validateRequest(
                updateServicioAdicionalSchema
            ),
            asyncHandler(
                controller.actualizar
            )
        );

        /**
         * @swagger
         * /servicios-adicionales/{id}:
         *   get:
         *     summary: Obtener un servicio adicional por ID
         *     tags: [Servicios Adicionales]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 1
         *     responses:
         *       200:
         *         description: Servicio adicional encontrado
         *       404:
         *         description: Servicio adicional no encontrado
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