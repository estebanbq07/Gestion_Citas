import winston from "winston";
import "winston-daily-rotate-file";

// Helper para asegurar que la información completa del Error no se pierda al serializar a JSON
const errorFormatter = winston.format((info) => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
            message: info.message,
            stack: info.stack,
        });
    }
    if (info.error instanceof Error) {
        info.error = Object.assign({}, info.error, {
            message: info.error.message,
            stack: info.error.stack,
        });
    }
    return info;
});

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    errorFormatter(), // Formatea el Error correctamente
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf((info: any) => {
        const { timestamp, level, message, stack, error } = info;
        // Muestra el stack o la propiedad message del error capturado
        const detail = stack || (error && error.stack) || (error && error.message) || "";
        return detail
            ? `${timestamp} ${level}: ${message}\n${detail}`
            : `${timestamp} ${level}: ${message}`;
    })
);

export const logger = winston.createLogger({
    level: "debug",
    format: logFormat,
    transports: [
        new winston.transports.DailyRotateFile({
            filename: "%DATE%-app.log",
            dirname: "logs",
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
            zippedArchive: true,
        }),
        new winston.transports.Console({
            level: "debug",
            format: consoleFormat,
            handleExceptions: true,
        }),
    ],
    exitOnError: false,
});