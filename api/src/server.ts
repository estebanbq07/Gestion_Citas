import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import { AppRoutes } from "./routes/routes";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

dotenv.config();

const app = express();
const port = Number(process.env["PORT"]) || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        message: "API de eventos funcionando correctamente",
    });
});

// Imágenes
app.use(
    "/images",
    express.static(path.join(process.cwd(), "assets", "uploads"))
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use("/", AppRoutes.routes);
// Middleware de errores
app.use(ErrorMiddleware.handleError);
// Servidor
const server = app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
    console.log(`Documentación en http://localhost:${port}/api-docs`);
});

server.on("error", (error) => {
    console.error("ERROR DEL SERVIDOR");
    console.error(error);
});