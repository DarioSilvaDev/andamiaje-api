import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { envs } from "./envs";

// const allowedOriginsProd = envs.ALLOWEDORIGINSPROD.split(",");
console.log("🚀 ~ envs.ALLOWEDORIGINSPROD:", envs.ALLOWEDORIGINSPROD);
const allowedOriginsProd = envs.ALLOWEDORIGINSPROD.split(",").map((o: string) =>
  o.trim()
);
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const isProd = process.env.NODE_ENV === "production";
    const isAllowed = !origin || allowedOriginsProd.includes(origin);

    console.log(
      `🌐 [CORS] Origin: ${origin} | isProd: ${isProd} | Allowed: ${isAllowed}`
    );

    if (isProd && isAllowed) return callback(null, true);
    if (!origin && origin?.startsWith("http://localhost"))
      return callback(null, true);

    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
