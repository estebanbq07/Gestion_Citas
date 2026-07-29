import swaggerJSDoc from "swagger-jsdoc";

/**
 * ============================================================================
 *  CONFIGURACIÓN CENTRAL DE SWAGGER
 * ============================================================================
 */
export const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Gestión de Citas API",
            version: "1.0.0",
            description:
                "Documentación del API para el sistema de gestión de citas, servicios, empleados, horarios, restricciones y disponibilidad.",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor local",
            },
        ],
        components: {
            
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description:
                        "Token JWT obtenido en POST /usuarios/login. Debe enviarse en el encabezado como: Authorization: Bearer <token>",
                },
            },
            schemas: {},
        },
    },
    apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);