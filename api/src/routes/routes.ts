import { Router } from "express";

import { RolRoutes } from "./rol.routes";
import { UsuarioRoutes } from "./usuario.routes";
import { EspecialidadRoutes } from "./especialidad.routes";
import { ServicioRoutes } from "./servicio.routes";
import { ServicioAdicionalRoutes } from "./servicio-adicional.routes";
import { EmpleadoRoutes } from "./empleado.routes";
import { EstadoCitaRoutes } from "./estado-cita.routes";
import { DiaSemanaRoutes } from "./dia-semana.routes";
import { HorarioAtencionRoutes } from "./horario-atencion.routes";
import { TipoRestriccionHorarioRoutes } from "./tipo-restriccion-horario.routes";
import { RestriccionHorarioRoutes } from "./restriccion-horario.routes";
import { CitaRoutes } from "./cita.routes";

export class AppRoutes {
    static get routes(): Router {
        const router = Router();

        // Seguridad
        router.use("/usuarios", UsuarioRoutes.routes);
        router.use("/roles", RolRoutes.routes);

        // Catálogos
        router.use("/especialidades", EspecialidadRoutes.routes);
        router.use("/servicios", ServicioRoutes.routes);
        router.use("/servicios-adicionales", ServicioAdicionalRoutes.routes);
        router.use("/estados-cita", EstadoCitaRoutes.routes);
        router.use("/dias-semana", DiaSemanaRoutes.routes);
        router.use("/horarios-atencion", HorarioAtencionRoutes.routes);
        router.use("/tipos-restriccion-horario", TipoRestriccionHorarioRoutes.routes);

        // Gestión
        router.use("/empleados", EmpleadoRoutes.routes);
        router.use("/restricciones-horario", RestriccionHorarioRoutes.routes);
        router.use("/citas", CitaRoutes.routes);

        return router;
    }
}