import * as Joi from "joi";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Esquema de validación para las variables de entorno
const envSchema = Joi.object({
  // Configuración de la aplicación
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),

  PACKAGE_VERSION: Joi.string().default(
    process.env.npm_package_version || "1.0"
  ),
  PACKAGE_NAME: Joi.string().default(
    process.env.npm_package_name || "andamiaje-api"
  ),

  PORT: Joi.number().default(5001),
  API_PREFIX: Joi.string().default("api/v1"),

  // Configuración de la base de datos
  // DB_HOST: Joi.string().default("localhost"),
  // DB_PORT: Joi.number().default(5432),
  // DB_USERNAME: Joi.string().required(),
  // DB_PASSWORD: Joi.string().required(),
  // DB_DATABASE: Joi.string().required(),
  // DB_SYNCHRONIZE: Joi.boolean().default(false),
  // DB_LOGGING: Joi.boolean().default(true),

  B2_ENDPOINT: Joi.string().required(),
  B2_REGION: Joi.string().required(),
  B2_BUCKET: Joi.string().required(),
  B2_KEY_ID: Joi.string().required(),
  B2_APP_KEY: Joi.string().required(),
  B2_BUCKET_ID: Joi.string().required(),

  ALLOWEDORIGINSPROD: Joi.string().default("http://localhost:3000"),

  DATABASE_URL: Joi.string().required(),

  // Configuración de JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default("24h"),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),

  // Configuración de archivos
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  ALLOWED_FILE_TYPES: Joi.string().default("pdf,jpg,jpeg,png"),

  // Configuración de logging
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "debug")
    .default("info"),
  LOG_DIR: Joi.string().default("./logs"),
}).unknown();

// Validar y exportar las variables de entorno
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(
    `Error de validación de variables de entorno: ${error.details.map((detail) => detail.message).join(", ")}`
  );
}

export const envs = {
  // Configuración de la aplicación
  NODE_ENV: envVars.NODE_ENV,

  NPM_PACKAGE_VERSION: envVars.PACKAGE_VERSION,
  NPM_PACKAGE_NAME: envVars.PACKAGE_NAME,

  PORT: envVars.PORT,
  API_PREFIX: envVars.API_PREFIX,

  // Configuración de la base de datos
  // DB_HOST: envVars.DB_HOST,
  // DB_PORT: envVars.DB_PORT,
  // DB_USERNAME: envVars.DB_USERNAME,
  // DB_PASSWORD: envVars.DB_PASSWORD,
  // DB_DATABASE: envVars.DB_DATABASE,
  // DB_SYNCHRONIZE: envVars.DB_SYNCHRONIZE,
  // DB_LOGGING: envVars.DB_LOGGING,
  B2_ENDPOINT: envVars.B2_ENDPOINT,
  B2_REGION: envVars.B2_REGION,
  B2_BUCKET: envVars.B2_BUCKET,
  B2_KEY_ID: envVars.B2_KEY_ID,
  B2_APP_KEY: envVars.B2_APP_KEY,
  B2_BUCKET_ID: envVars.B2_BUCKET_ID,

  DATABASE_URL: envVars.DATABASE_URL,

  ALLOWEDORIGINSPROD: envVars.ALLOWEDORIGINSPROD,

  // Configuración de JWT
  JWT_SECRET: envVars.JWT_SECRET,
  JWT_EXPIRES_IN: envVars.JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET: envVars.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: envVars.JWT_REFRESH_EXPIRES_IN,

  // Configuración de archivos
  MAX_FILE_SIZE: envVars.MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES: envVars.ALLOWED_FILE_TYPES.split(","),

  // Configuración de logging
  LOG_LEVEL: envVars.LOG_LEVEL,
  LOG_DIR: envVars.LOG_DIR,
};
