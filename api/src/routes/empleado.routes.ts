import { Router } from "express";
import { EmpleadoController } from "../controllers/empleado.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    createEmpleadoSchema,
    updateEmpleadoSchema,
    updateEstadoEmpleadoSchema,
} from "../dtos/empleado.dto";

export class EmpleadoRoutes {
    static get routes(): Router {
        const router = Router();
        const controller =
            new EmpleadoController();
        /**
         * @swagger
         * tags:
         *   name: Empleados
         *   description: Gestión de empleados, servicios asignados, estado y agenda.
         */

        /**
         * @swagger
         * components:
         *   schemas:
         *     CrearEmpleadoInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - usuarioId
         *         - especialidadId
         *         - codigoEmpleado
         *         - servicioIds
         *       properties:
         *         usuarioId:
         *           type: integer
         *           minimum: 1
         *           example: 2
         *         especialidadId:
         *           type: integer
         *           minimum: 1
         *           example: 1
         *         codigoEmpleado:
         *           type: string
         *           minLength: 3
         *           maxLength: 30
         *           pattern: '^[A-Za-z0-9_-]+$'
         *           example: EMP-001
         *         descripcion:
         *           type: string
         *           nullable: true
         *           maxLength: 500
         *           example: Empleado especializado en corte y barbería.
         *         servicioIds:
         *           type: array
         *           minItems: 1
         *           uniqueItems: true
         *           description: Identificadores de los servicios que puede atender.
         *           items:
         *             type: integer
         *             minimum: 1
         *           example: [1, 2, 3]
         *
         *     ActualizarEmpleadoInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - usuarioId
         *         - especialidadId
         *         - codigoEmpleado
         *         - descripcion
         *         - servicioIds
         *       properties:
         *         usuarioId:
         *           type: integer
         *           minimum: 1
         *           example: 2
         *         especialidadId:
         *           type: integer
         *           minimum: 1
         *           example: 1
         *         codigoEmpleado:
         *           type: string
         *           minLength: 3
         *           maxLength: 30
         *           pattern: '^[A-Za-z0-9_-]+$'
         *           example: EMP-001
         *         descripcion:
         *           type: string
         *           nullable: true
         *           maxLength: 500
         *           example: Empleado especializado en barbería y estilismo.
         *         servicioIds:
         *           type: array
         *           minItems: 1
         *           uniqueItems: true
         *           description: Reemplaza completamente los servicios actuales.
         *           items:
         *             type: integer
         *             minimum: 1
         *           example: [1, 4, 5]
         *
         *     CambiarEstadoEmpleadoInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - activo
         *       properties:
         *         activo:
         *           type: boolean
         *           example: false
         *
         *     UsuarioEmpleadoResponse:
         *       type: object
         *       properties:
         *         id:
         *           type: integer
         *           example: 2
         *         nombre:
         *           type: string
         *           example: Carlos
         *         primerApellido:
         *           type: string
         *           example: Mora
         *         segundoApellido:
         *           type: string
         *           nullable: true
         *           example: Rojas
         *         correo:
         *           type: string
         *           format: email
         *           example: carlos@example.com
         *         telefono:
         *           type: string
         *           nullable: true
         *           example: "8888-8888"
         *         activo:
         *           type: boolean
         *           example: true
         *
         *     ServicioEmpleadoResponse:
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
         *           example: Servicio profesional de corte.
         *         precioBase:
         *           type: string
         *           example: "8000.00"
         *         duracionMinutos:
         *           type: integer
         *           example: 45
         *         activo:
         *           type: boolean
         *           example: true
         *         especialidadId:
         *           type: integer
         *           example: 1
         *
         *     EmpleadoResponse:
         *       type: object
         *       properties:
         *         id:
         *           type: integer
         *           example: 1
         *         usuarioId:
         *           type: integer
         *           example: 2
         *         especialidadId:
         *           type: integer
         *           example: 1
         *         codigoEmpleado:
         *           type: string
         *           example: EMP-001
         *         descripcion:
         *           type: string
         *           nullable: true
         *           example: Empleado especializado en corte y barbería.
         *         activo:
         *           type: boolean
         *           example: true
         *         creadoEn:
         *           type: string
         *           format: date-time
         *         actualizadoEn:
         *           type: string
         *           format: date-time
         *         usuario:
         *           $ref: '#/components/schemas/UsuarioEmpleadoResponse'
         *         servicios:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/ServicioEmpleadoResponse'
         *
         *     ErrorEmpleadoResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: false
         *         message:
         *           type: string
         *           example: El empleado no existe
         */

        /**
         * @swagger
         * /empleados:
         *   get:
         *     summary: Listar todos los empleados
         *     description: Retorna empleados activos e inactivos con usuario, especialidad, servicios asignados y cantidad de citas.
         *     tags: [Empleados]
         *     responses:
         *       200:
         *         description: Lista de empleados
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
         *                     $ref: '#/components/schemas/EmpleadoResponse'
         */
        router.get(
            "/",
            asyncHandler(
                controller.listar
            )
        );

        /**
         * @swagger
         * /empleados/activos:
         *   get:
         *     summary: Listar empleados activos
         *     description: Retorna empleados disponibles para recibir nuevas citas. Puede filtrarse por servicio.
         *     tags: [Empleados]
         *     parameters:
         *       - in: query
         *         name: servicioId
         *         required: false
         *         description: Filtra empleados que pueden atender el servicio indicado.
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 2
         *     responses:
         *       200:
         *         description: Lista de empleados activos
         *       400:
         *         description: Identificador de servicio inválido
         */
        router.get(
            "/activos",
            asyncHandler(
                controller.listarActivos
            )
        );

        /**
         * @swagger
         * /empleados:
         *   post:
         *     summary: Crear empleado
         *     description: Crea un empleado activo y asigna los servicios que puede atender.
         *     tags: [Empleados]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CrearEmpleadoInput'
         *           example:
         *             usuarioId: 2
         *             especialidadId: 1
         *             codigoEmpleado: EMP-001
         *             descripcion: Empleado especializado en corte y barbería.
         *             servicioIds: [1, 2, 3]
         *     responses:
         *       201:
         *         description: Empleado creado correctamente
         *       400:
         *         description: Datos inválidos o relaciones inexistentes
         *       409:
         *         description: Usuario ya asociado o código duplicado
         */
        router.post(
            "/",
            validateRequest(
                createEmpleadoSchema
            ),
            asyncHandler(
                controller.crear
            )
        );

        /**
         * @swagger
         * /empleados/{id}/agenda:
         *   get:
         *     summary: Consultar agenda del empleado
         *     description: Retorna citas no canceladas y restricciones activas para la fecha indicada.
         *     tags: [Empleados]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 1
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
            "/:id/agenda",
            asyncHandler(
                controller.agenda
            )
        );

        /**
         * @swagger
         * /empleados/{id}/estado:
         *   patch:
         *     summary: Activar o desactivar empleado
         *     description: No permite desactivar empleados con citas pendientes o confirmadas.
         *     tags: [Empleados]
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
         *             $ref: '#/components/schemas/CambiarEstadoEmpleadoInput'
         *     responses:
         *       200:
         *         description: Estado actualizado correctamente
         *       400:
         *         description: Estado inválido
         *       404:
         *         description: El empleado no existe
         *       409:
         *         description: El empleado posee citas pendientes o confirmadas
         */
        router.patch(
            "/:id/estado",
            validateRequest(
                updateEstadoEmpleadoSchema
            ),
            asyncHandler(
                controller.cambiarEstado
            )
        );

        /**
         * @swagger
         * /empleados/{id}:
         *   put:
         *     summary: Modificar empleado
         *     description: Modifica todos los atributos editables y reemplaza completamente los servicios asignados.
         *     tags: [Empleados]
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
         *             $ref: '#/components/schemas/ActualizarEmpleadoInput'
         *           example:
         *             usuarioId: 2
         *             especialidadId: 1
         *             codigoEmpleado: EMP-001
         *             descripcion: Empleado especializado en barbería y estilismo.
         *             servicioIds: [1, 4, 5]
         *     responses:
         *       200:
         *         description: Empleado actualizado correctamente
         *       400:
         *         description: Datos inválidos o relaciones inexistentes
         *       404:
         *         description: El empleado no existe
         *       409:
         *         description: Usuario ya asociado o código duplicado
         */
        router.put(
            "/:id",
            validateRequest(
                updateEmpleadoSchema
            ),
            asyncHandler(
                controller.actualizar
            )
        );

        /**
         * @swagger
         * /empleados/{id}:
         *   get:
         *     summary: Obtener empleado por identificador
         *     description: Retorna usuario, especialidad, servicios, restricciones y citas asignadas.
         *     tags: [Empleados]
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
         *         description: Empleado encontrado
         *       404:
         *         description: El empleado no existe
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