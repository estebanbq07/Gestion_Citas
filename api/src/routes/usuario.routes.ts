import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import {
    registerClienteSchema,
    loginSchema,
    updateUsuarioSchema,
} from "../dtos/usuario.dto";

import { authenticateToken } from "../middlewares/auth.middleware";

export class UsuarioRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UsuarioController();

        /**
         * @swagger
         * tags:
         *   name: Usuarios
         *   description: Registro de clientes, autenticación y consulta de usuarios.
         */
        /**
         * @swagger
         * components:
         *   schemas:
         *     RegistroClienteInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - nombre
         *         - primerApellido
         *         - correo
         *         - password
         *       properties:
         *         nombre:
         *           type: string
         *           minLength: 2
         *           maxLength: 100
         *           example: María
         *         primerApellido:
         *           type: string
         *           minLength: 2
         *           maxLength: 100
         *           example: López
         *         segundoApellido:
         *           type: string
         *           nullable: true
         *           minLength: 2
         *           maxLength: 100
         *           example: Mora
         *         correo:
         *           type: string
         *           format: email
         *           maxLength: 150
         *           example: maria@example.com
         *         telefono:
         *           type: string
         *           nullable: true
         *           minLength: 8
         *           maxLength: 25
         *           example: "8888-8888"
         *         password:
         *           type: string
         *           format: password
         *           minLength: 8
         *           maxLength: 100
         *           example: Cliente123
         *
         *     LoginInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - correo
         *         - password
         *       properties:
         *         correo:
         *           type: string
         *           format: email
         *           maxLength: 150
         *           example: maria@example.com
         *         password:
         *           type: string
         *           format: password
         *           minLength: 1
         *           maxLength: 100
         *           example: Cliente123
         *
         *     ActualizarUsuarioInput:
         *       type: object
         *       additionalProperties: false
         *       required:
         *         - nombre
         *         - primerApellido
         *         - segundoApellido
         *         - correo
         *         - telefono
         *         - rolId
         *       properties:
         *         nombre:
         *           type: string
         *           minLength: 2
         *           maxLength: 100
         *           example: María Fernanda
         *         primerApellido:
         *           type: string
         *           minLength: 2
         *           maxLength: 100
         *           example: López
         *         segundoApellido:
         *           type: string
         *           nullable: true
         *           minLength: 2
         *           maxLength: 100
         *           example: Mora
         *         correo:
         *           type: string
         *           format: email
         *           maxLength: 150
         *           example: maria.fernanda@example.com
         *         telefono:
         *           type: string
         *           nullable: true
         *           minLength: 8
         *           maxLength: 25
         *           example: "8888-9999"
         *         rolId:
         *           type: integer
         *           minimum: 1
         *           example: 3
         *
         *     RolUsuario:
         *       type: object
         *       properties:
         *         id:
         *           type: integer
         *           example: 3
         *         nombre:
         *           type: string
         *           example: Cliente
         *         descripcion:
         *           type: string
         *           nullable: true
         *           example: Usuario que puede registrar y consultar sus citas.
         *         activo:
         *           type: boolean
         *           example: true
         *
         *     EmpleadoUsuario:
         *       type: object
         *       nullable: true
         *       properties:
         *         id:
         *           type: integer
         *           example: 2
         *         usuarioId:
         *           type: integer
         *           example: 5
         *         especialidadId:
         *           type: integer
         *           nullable: true
         *           example: 1
         *         activo:
         *           type: boolean
         *           example: true
         *
         *     UsuarioResponse:
         *       type: object
         *       properties:
         *         id:
         *           type: integer
         *           example: 5
         *         nombre:
         *           type: string
         *           example: María
         *         primerApellido:
         *           type: string
         *           example: López
         *         segundoApellido:
         *           type: string
         *           nullable: true
         *           example: Mora
         *         correo:
         *           type: string
         *           format: email
         *           example: maria@example.com
         *         telefono:
         *           type: string
         *           nullable: true
         *           example: "8888-8888"
         *         activo:
         *           type: boolean
         *           example: true
         *         rolId:
         *           type: integer
         *           example: 3
         *         creadoEn:
         *           type: string
         *           format: date-time
         *           example: "2026-07-11T15:30:00.000Z"
         *         actualizadoEn:
         *           type: string
         *           format: date-time
         *           example: "2026-07-11T15:30:00.000Z"
         *         rol:
         *           $ref: '#/components/schemas/RolUsuario'
         *         empleado:
         *           allOf:
         *             - $ref: '#/components/schemas/EmpleadoUsuario'
         *           nullable: true
         *
         *     LoginResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         message:
         *           type: string
         *           example: Inicio de sesión correcto
         *         data:
         *           type: object
         *           properties:
         *             token:
         *               type: string
         *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
         *
         *     UsuarioSuccessResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         message:
         *           type: string
         *           example: Operación realizada correctamente
         *         data:
         *           $ref: '#/components/schemas/UsuarioResponse'
         *
         *     UsuariosListResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: true
         *         data:
         *           type: array
         *           items:
         *             $ref: '#/components/schemas/UsuarioResponse'
         *
         *     ErrorResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: false
         *         message:
         *           type: string
         *           example: Se produjo un error
         *
         *     ValidationErrorResponse:
         *       type: object
         *       properties:
         *         success:
         *           type: boolean
         *           example: false
         *         name:
         *           type: string
         *           example: BadRequestError
         *         message:
         *           type: string
         *           example: Datos de entrada inválidos
         *         validationErrors:
         *           type: array
         *           items:
         *             type: object
         *             properties:
         *               field:
         *                 type: string
         *                 example: correo
         *               message:
         *                 type: string
         *                 example: El correo electrónico no tiene un formato válido
         */
        /**
         * @swagger
         * /usuarios/registro:
         *   post:
         *     summary: Registrar un cliente
         *     description: >
         *       Registra públicamente un nuevo usuario con el rol Cliente.
         *       El rol y el estado activo son asignados automáticamente por el API.
         *       No se permite enviar rolId, activo ni passwordHash.
         *     tags:
         *       - Usuarios
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/RegistroClienteInput'
         *           examples:
         *             clienteCompleto:
         *               summary: Cliente con todos los datos
         *               value:
         *                 nombre: María
         *                 primerApellido: López
         *                 segundoApellido: Mora
         *                 correo: maria@example.com
         *                 telefono: "8888-8888"
         *                 password: Cliente123
         *             clienteSinDatosOpcionales:
         *               summary: Cliente sin segundo apellido ni teléfono
         *               value:
         *                 nombre: Ana
         *                 primerApellido: Rojas
         *                 correo: ana@example.com
         *                 password: Cliente123
         *     responses:
         *       201:
         *         description: Cliente registrado correctamente
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/UsuarioSuccessResponse'
         *       400:
         *         description: Datos de entrada inválidos
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ValidationErrorResponse'
         *       409:
         *         description: El correo ya está registrado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         *             example:
         *               success: false
         *               message: El correo ya está registrado
         *       500:
         *         description: Error interno del servidor
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         */
        router.post(
            "/registro",
            validateRequest(registerClienteSchema),
            asyncHandler(controller.registrarCliente)
        );
        /**
         * @swagger
         * /usuarios/login:
         *   post:
         *     summary: Iniciar sesión
         *     description: >
         *       Valida el correo y la contraseña del usuario. Si las credenciales
         *       son correctas, devuelve un token JWT que debe enviarse mediante
         *       el encabezado Authorization para consultar el perfil.
         *     tags:
         *       - Usuarios
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/LoginInput'
         *           example:
         *             correo: maria@example.com
         *             password: Cliente123
         *     responses:
         *       200:
         *         description: Inicio de sesión correcto
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/LoginResponse'
         *       400:
         *         description: Datos de entrada inválidos
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ValidationErrorResponse'
         *       401:
         *         description: Credenciales incorrectas o usuario inactivo
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         *             example:
         *               success: false
         *               message: Credenciales incorrectas
         *       500:
         *         description: Error interno del servidor
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         */
        router.post(
            "/login",
            validateRequest(loginSchema),
            asyncHandler(controller.login)
        );
        /**
         * @swagger
         * /usuarios/perfil:
         *   get:
         *     summary: Obtener el perfil del usuario autenticado
         *     description: >
         *       Obtiene la información del usuario autenticado. El identificador
         *       del usuario se extrae del token JWT y no se recibe como parámetro.
         *     tags:
         *       - Usuarios
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Perfil obtenido correctamente
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/UsuarioSuccessResponse'
         *       401:
         *         description: Token no proporcionado, inválido o expirado
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         *             examples:
         *               tokenNoProporcionado:
         *                 summary: No se envió el token
         *                 value:
         *                   success: false
         *                   message: Token no proporcionado
         *               tokenInvalido:
         *                 summary: Token inválido o expirado
         *                 value:
         *                   success: false
         *                   message: Token inválido o expirado
         *       500:
         *         description: Error interno del servidor
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         */
        router.get(
            "/perfil",
            authenticateToken,
            asyncHandler(controller.perfil)
        );
        /**
         * @swagger
         * /usuarios:
         *   get:
         *     summary: Listar usuarios
         *     description: >
         *       Retorna todos los usuarios del sistema. Puede filtrarse la lista
         *       mediante el nombre del rol.
         *     tags:
         *       - Usuarios
         *     parameters:
         *       - in: query
         *         name: rol
         *         required: false
         *         description: Nombre del rol utilizado para filtrar los usuarios
         *         schema:
         *           type: string
         *           enum:
         *             - Administrador
         *             - Empleado
         *             - Cliente
         *         examples:
         *           cliente:
         *             value: Cliente
         *           empleado:
         *             value: Empleado
         *     responses:
         *       200:
         *         description: Lista de usuarios
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/UsuariosListResponse'
         *       500:
         *         description: Error interno del servidor
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         */
        router.get(
            "/",
            asyncHandler(controller.listar)
        );
        /**
         * @swagger
         * /usuarios/{id}:
         *   put:
         *     summary: Modificar un usuario
         *     description: >
         *       Modifica completamente los atributos editables de un usuario.
         *       Como se utiliza PUT, deben enviarse todos los campos definidos
         *       en el DTO. segundoApellido y telefono pueden enviarse como null.
         *       No permite modificar la contraseña ni el estado activo.
         *     tags:
         *       - Usuarios
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Identificador del usuario que se desea modificar
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 5
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/ActualizarUsuarioInput'
         *           examples:
         *             usuarioCompleto:
         *               summary: Usuario con todos sus datos
         *               value:
         *                 nombre: María Fernanda
         *                 primerApellido: López
         *                 segundoApellido: Mora
         *                 correo: maria.fernanda@example.com
         *                 telefono: "8888-9999"
         *                 rolId: 3
         *             usuarioSinDatosOpcionales:
         *               summary: Eliminar segundo apellido y teléfono
         *               value:
         *                 nombre: María Fernanda
         *                 primerApellido: López
         *                 segundoApellido: null
         *                 correo: maria.fernanda@example.com
         *                 telefono: null
         *                 rolId: 3
         *     responses:
         *       200:
         *         description: Usuario actualizado correctamente
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/UsuarioSuccessResponse'
         *       400:
         *         description: Datos inválidos o el rol indicado no existe
         *         content:
         *           application/json:
         *             schema:
         *               oneOf:
         *                 - $ref: '#/components/schemas/ValidationErrorResponse'
         *                 - $ref: '#/components/schemas/ErrorResponse'
         *       404:
         *         description: El usuario no existe
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         *             example:
         *               success: false
         *               message: El usuario no existe
         *       409:
         *         description: El correo pertenece a otro usuario
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         *             example:
         *               success: false
         *               message: El correo ya está registrado por otro usuario
         *       500:
         *         description: Error interno del servidor
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         */
        router.put(
            "/:id",
            validateRequest(updateUsuarioSchema),
            asyncHandler(controller.actualizar)
        );
        /**
         * @swagger
         * /usuarios/{id}:
         *   get:
         *     summary: Obtener un usuario por identificador
         *     description: >
         *       Retorna el detalle de un usuario. La respuesta nunca incluye
         *       el atributo passwordHash.
         *     tags:
         *       - Usuarios
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         description: Identificador del usuario
         *         schema:
         *           type: integer
         *           minimum: 1
         *         example: 5
         *     responses:
         *       200:
         *         description: Usuario encontrado
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                   example: true
         *                 data:
         *                   $ref: '#/components/schemas/UsuarioResponse'
         *       404:
         *         description: El usuario no existe
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         *             example:
         *               success: false
         *               message: El usuario no existe
         *       500:
         *         description: Error interno del servidor
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ErrorResponse'
         */
        router.get(
            "/:id",
            asyncHandler(controller.obtenerPorId)
        );
        return router;
    }
}