
import { prisma } from "../src/config/prisma";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Iniciando seed...");
     // Roles
    const administrador = await prisma.rol.upsert({
        where: { nombre: "Administrador" },
        update: {},
        create: {
            nombre: "Administrador",
            descripcion: "Usuario con acceso completo al sistema.",
            activo: true,
        },
    });

    await prisma.rol.upsert({
        where: { nombre: "Empleado" },
        update: {},
        create: {
            nombre: "Empleado",
            descripcion: "Usuario encargado de atender citas asignadas.",
            activo: true,
        },
    });

    await prisma.rol.upsert({
        where: { nombre: "Cliente" },
        update: {},
        create: {
            nombre: "Cliente",
            descripcion: "Usuario que puede consultar sus citas y cancelarlas cuando corresponda.",
            activo: true,
        },
    });

    // Estados de cita
    await prisma.estadoCita.upsert({
        where: { nombre: "Pendiente" },
        update: {},
        create: {
            nombre: "Pendiente",
            descripcion: "Cita registrada, pendiente de confirmación.",
            bloqueaDisponibilidad: true,
            permiteCancelacionCliente: true,
            permiteEdicion: true,
            color: "amarillo",
            orden: 1,
            activo: true,
        },
    });

    await prisma.estadoCita.upsert({
        where: { nombre: "Confirmada" },
        update: {},
        create: {
            nombre: "Confirmada",
            descripcion: "Cita confirmada por el establecimiento.",
            bloqueaDisponibilidad: true,
            permiteCancelacionCliente: false,
            permiteEdicion: true,
            color: "azul",
            orden: 2,
            activo: true,
        },
    });

    await prisma.estadoCita.upsert({
        where: { nombre: "En proceso" },
        update: {},
        create: {
            nombre: "En proceso",
            descripcion: "Cita que se encuentra siendo atendida.",
            bloqueaDisponibilidad: true,
            permiteCancelacionCliente: false,
            permiteEdicion: false,
            color: "morado",
            orden: 3,
            activo: true,
        },
    });

    await prisma.estadoCita.upsert({
        where: { nombre: "Finalizada" },
        update: {},
        create: {
            nombre: "Finalizada",
            descripcion: "Cita atendida y finalizada.",
            bloqueaDisponibilidad: false,
            permiteCancelacionCliente: false,
            permiteEdicion: false,
            color: "verde",
            orden: 4,
            activo: true,
        },
    });

    await prisma.estadoCita.upsert({
        where: { nombre: "Cancelada" },
        update: {},
        create: {
            nombre: "Cancelada",
            descripcion: "Cita cancelada. No bloquea disponibilidad.",
            bloqueaDisponibilidad: false,
            permiteCancelacionCliente: false,
            permiteEdicion: false,
            color: "rojo",
            orden: 5,
            activo: true,
        },
    });

    // Días de semana
    const dias = [
        { nombre: "Lunes", numeroOrden: 1 },
        { nombre: "Martes", numeroOrden: 2 },
        { nombre: "Miércoles", numeroOrden: 3 },
        { nombre: "Jueves", numeroOrden: 4 },
        { nombre: "Viernes", numeroOrden: 5 },
        { nombre: "Sábado", numeroOrden: 6 },
        { nombre: "Domingo", numeroOrden: 7 },
    ];

    for (const dia of dias) {
        await prisma.diaSemana.upsert({
            where: { nombre: dia.nombre },
            update: {},
            create: dia,
        });
    }

    // Tipos de restricción
    await prisma.tipoRestriccionHorario.upsert({
        where: { nombre: "General del establecimiento" },
        update: {},
        create: {
            nombre: "General del establecimiento",
            descripcion: "Restricción que afecta a todos los empleados del establecimiento.",
        },
    });

    await prisma.tipoRestriccionHorario.upsert({
        where: { nombre: "Específica de empleado" },
        update: {},
        create: {
            nombre: "Específica de empleado",
            descripcion: "Restricción que afecta únicamente a un empleado específico.",
        },
    });

    await prisma.tipoRestriccionHorario.upsert({
        where: { nombre: "Parcial por horas" },
        update: {},
        create: {
            nombre: "Parcial por horas",
            descripcion: "Restricción aplicada a un rango específico de horas.",
        },
    });

    await prisma.tipoRestriccionHorario.upsert({
        where: { nombre: "Día completo" },
        update: {},
        create: {
            nombre: "Día completo",
            descripcion: "Restricción que bloquea todo el día seleccionado.",
        },
    });

    // Especialidad base
    await prisma.especialidad.upsert({
        where: { nombre: "General" },
        update: {},
        create: {
            nombre: "General",
            descripcion: "Especialidad base para servicios y empleados generales.",
            activo: true,
        },
    });

    // Usuario administrador
    const passwordHash = await bcrypt.hash("Admin12345", 10);

    await prisma.usuario.upsert({
        where: { correo: "admin@citas.com" },
        update: {},
        create: {
            nombre: "Administrador",
            primerApellido: "Sistema",
            segundoApellido: null,
            correo: "admin@citas.com",
            telefono: "88888888",
            passwordHash,
            activo: true,
            rolId: administrador.id,
        },
    });
    console.log("Seeder ejecutado correctamente.");
}

main()
    .catch((e) => {
        console.error("Error en seed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });