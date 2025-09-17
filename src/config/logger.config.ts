import { WinstonModule } from "nest-winston";
import * as winston from "winston";
// import * as DailyRotateFile from 'winston-daily-rotate-file';
import { envs } from "./envs";

export const loggerConfig = WinstonModule.createLogger({
  level: envs.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "andamiaje-api" },
  transports: [
    // Consola
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
  //   // Archivo de logs diarios
  //   new DailyRotateFile({
  //     filename: `${envs.LOG_DIR}/application-%DATE%.log`,
  //     datePattern: 'YYYY-MM-DD',
  //     zippedArchive: true,
  //     maxSize: '20m',
  //     maxFiles: '14d',
  //     level: 'info',
  //   }),
  //   // Archivo de errores
  //   new DailyRotateFile({
  //     filename: `${envs.LOG_DIR}/error-%DATE%.log`,
  //     datePattern: 'YYYY-MM-DD',
  //     zippedArchive: true,
  //     maxSize: '20m',
  //     maxFiles: '14d',
  //     level: 'error',
  //   }),
  // ],
});
