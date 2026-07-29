import { Router } from "express";
import { RolController } from "../controllers/rol.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class RolRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new RolController();
        /**
         * @swagger
         * tags:
         *   name: Roles
         *   description: Consulta de roles del sistema, utilizados para controlar los permisos de los usuarios.
         */
        /**
         * @swagger
         * components:
         *   schemas:
         *     Rol:
         *       type: object
         *       description: Rol asignable a un usuario del sistema.
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         nombre:
         *           type: string
         *           maxLength: 50
         *           description: Nombre único del rol.
         *           example: Administrador
         *         descripcion:
         *           type: string
         *           nullable: true
         *           maxLength: 255
         *           example: Acceso total al sistema.
         *         activo:
         *           type: boolean
         *           default: true
         *           example: true
         *       required:
         *         - id
         *         - nombre
         *
         *     RolListResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/Rol'
         *
         *     RolDetailResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           $ref: '#/components/schemas/Rol'
         *
         *     RolErrorResponse:
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
         * /roles:
         *   get:
         *     summary: Obtener todos los roles
         *     description: Retorna todos los roles del sistema (activos e inactivos), ordenados alfabéticamente por nombre.
         *     tags: [Roles]
         *     responses:
         *       200:
         *         description: Lista de roles
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/RolListResponse'
         *             example:
         *               success: true
         *               data:
         *                 - id: 1
         *                   nombre: Administrador
         *                   descripcion: Acceso total al sistema.
         *                   activo: true
         *                 - id: 2
         *                   nombre: Cliente
         *                   descripcion: Usuario que agenda citas.
         *                   activo: true
         */
        router.get("/", asyncHandler(controller.listar));

        /**
         * @swagger
         * /roles/{id}:
         *   get:
         *     summary: Obtener rol por ID
         *     description: Retorna el detalle de un rol específico.
         *     tags: [Roles]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Identificador del rol
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 1
         *     responses:
         *       200:
         *         description: Rol encontrado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/RolDetailResponse'
         *             example:
         *               success: true
         *               data:
         *                 id: 1
         *                 nombre: Administrador
         *                 descripcion: Acceso total al sistema.
         *                 activo: true
         *       404:
         *         description: Rol no encontrado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/RolErrorResponse'
         *             example:
         *               success: false
         *               message: El rol no existe
         */
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}