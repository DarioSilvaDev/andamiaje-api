import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { envs } from "./envs";

const allowedOriginsProd = [envs.ALLOWEDORIGINSPROD]; // Define tus dominios permitidos en producción

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
      // ✅ Solo permitir tu dominio en producción
      if (origin && allowedOriginsProd.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    } else {
      // ✅ En desarrollo permitir cualquier localhost
      if (!origin || origin.startsWith("http://localhost")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
