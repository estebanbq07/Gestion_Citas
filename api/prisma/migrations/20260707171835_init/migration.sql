-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `roles_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `primerApellido` VARCHAR(100) NOT NULL,
    `segundoApellido` VARCHAR(100) NULL,
    `correo` VARCHAR(150) NOT NULL,
    `telefono` VARCHAR(25) NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `rolId` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    INDEX `usuarios_rolId_idx`(`rolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `especialidades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `especialidades_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` VARCHAR(500) NOT NULL,
    `precioBase` DECIMAL(10, 2) NOT NULL,
    `duracionMinutos` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `especialidadId` INTEGER NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `servicios_nombre_key`(`nombre`),
    INDEX `servicios_especialidadId_idx`(`especialidadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios_adicionales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` VARCHAR(500) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `servicios_adicionales_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empleados` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `especialidadId` INTEGER NOT NULL,
    `codigoEmpleado` VARCHAR(30) NOT NULL,
    `descripcion` VARCHAR(500) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `empleados_usuarioId_key`(`usuarioId`),
    UNIQUE INDEX `empleados_codigoEmpleado_key`(`codigoEmpleado`),
    INDEX `empleados_especialidadId_idx`(`especialidadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estados_cita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `bloqueaDisponibilidad` BOOLEAN NOT NULL DEFAULT true,
    `permiteCancelacionCliente` BOOLEAN NOT NULL DEFAULT false,
    `permiteEdicion` BOOLEAN NOT NULL DEFAULT true,
    `color` VARCHAR(30) NULL,
    `orden` INTEGER NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `estados_cita_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dias_semana` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(30) NOT NULL,
    `numeroOrden` INTEGER NOT NULL,

    UNIQUE INDEX `dias_semana_nombre_key`(`nombre`),
    UNIQUE INDEX `dias_semana_numeroOrden_key`(`numeroOrden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `horarios_atencion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `diaSemanaId` INTEGER NOT NULL,
    `horaInicio` TIME(0) NOT NULL,
    `horaFin` TIME(0) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `horarios_atencion_diaSemanaId_horaInicio_horaFin_key`(`diaSemanaId`, `horaInicio`, `horaFin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_restriccion_horario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    UNIQUE INDEX `tipos_restriccion_horario_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restricciones_horario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipoRestriccionId` INTEGER NOT NULL,
    `empleadoId` INTEGER NULL,
    `fecha` DATE NOT NULL,
    `horaInicio` TIME(0) NULL,
    `horaFin` TIME(0) NULL,
    `todoElDia` BOOLEAN NOT NULL DEFAULT false,
    `motivo` VARCHAR(255) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    INDEX `restricciones_horario_tipoRestriccionId_idx`(`tipoRestriccionId`),
    INDEX `restricciones_horario_empleadoId_idx`(`empleadoId`),
    INDEX `restricciones_horario_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `citas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `empleadoId` INTEGER NOT NULL,
    `servicioId` INTEGER NOT NULL,
    `estadoCitaId` INTEGER NOT NULL,
    `creadoPorUsuarioId` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `horaInicio` TIME(0) NOT NULL,
    `horaFin` TIME(0) NOT NULL,
    `duracionMinutos` INTEGER NOT NULL,
    `precioServicio` DECIMAL(10, 2) NOT NULL,
    `costoAdicionales` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `costoTotal` DECIMAL(10, 2) NOT NULL,
    `observaciones` VARCHAR(500) NULL,
    `motivoCancelacion` VARCHAR(255) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    INDEX `citas_clienteId_idx`(`clienteId`),
    INDEX `citas_empleadoId_idx`(`empleadoId`),
    INDEX `citas_servicioId_idx`(`servicioId`),
    INDEX `citas_estadoCitaId_idx`(`estadoCitaId`),
    INDEX `citas_fecha_idx`(`fecha`),
    INDEX `citas_empleadoId_fecha_horaInicio_idx`(`empleadoId`, `fecha`, `horaInicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EmpleadoServicios` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EmpleadoServicios_AB_unique`(`A`, `B`),
    INDEX `_EmpleadoServicios_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CitaAdicionales` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CitaAdicionales_AB_unique`(`A`, `B`),
    INDEX `_CitaAdicionales_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servicios` ADD CONSTRAINT `servicios_especialidadId_fkey` FOREIGN KEY (`especialidadId`) REFERENCES `especialidades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empleados` ADD CONSTRAINT `empleados_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empleados` ADD CONSTRAINT `empleados_especialidadId_fkey` FOREIGN KEY (`especialidadId`) REFERENCES `especialidades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `horarios_atencion` ADD CONSTRAINT `horarios_atencion_diaSemanaId_fkey` FOREIGN KEY (`diaSemanaId`) REFERENCES `dias_semana`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restricciones_horario` ADD CONSTRAINT `restricciones_horario_tipoRestriccionId_fkey` FOREIGN KEY (`tipoRestriccionId`) REFERENCES `tipos_restriccion_horario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restricciones_horario` ADD CONSTRAINT `restricciones_horario_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `empleados`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `empleados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_servicioId_fkey` FOREIGN KEY (`servicioId`) REFERENCES `servicios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_estadoCitaId_fkey` FOREIGN KEY (`estadoCitaId`) REFERENCES `estados_cita`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `citas` ADD CONSTRAINT `citas_creadoPorUsuarioId_fkey` FOREIGN KEY (`creadoPorUsuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EmpleadoServicios` ADD CONSTRAINT `_EmpleadoServicios_A_fkey` FOREIGN KEY (`A`) REFERENCES `empleados`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EmpleadoServicios` ADD CONSTRAINT `_EmpleadoServicios_B_fkey` FOREIGN KEY (`B`) REFERENCES `servicios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CitaAdicionales` ADD CONSTRAINT `_CitaAdicionales_A_fkey` FOREIGN KEY (`A`) REFERENCES `citas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CitaAdicionales` ADD CONSTRAINT `_CitaAdicionales_B_fkey` FOREIGN KEY (`B`) REFERENCES `servicios_adicionales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
