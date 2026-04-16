import { Response } from "express";
import { envs } from "@/config/envs";

/**
 * Configura cookies de autenticación (access y refresh) según el entorno.
 * - En local: no usa `secure` y aplica SameSite "none" (permite HTTP).
 * - En producción: usa `secure` y SameSite "none" (requerido para HTTPS cross-domain).
 */
export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; expiresIn: number },
) {
  const isProd = envs.NODE_ENV === "production";
  const refreshPath = `/${envs.API_PREFIX}/auth/refresh`;

  const cookieOptionsBase = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
  } as const;

  // Access Token cookie
  res.cookie("accessToken", tokens.accessToken, {
    ...cookieOptionsBase,
    path: "/",
    maxAge: tokens.expiresIn * 1000, // en ms
  });

  // Refresh Token cookie (por ejemplo, 7 días)
  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptionsBase,
    path: refreshPath,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

/**
 * Limpia las cookies de autenticación del usuario (logout).
 */
export function clearAuthCookies(res: Response) {
  const isProd = envs.NODE_ENV === "production";
  const refreshPath = `/${envs.API_PREFIX}/auth/refresh`;

  const clearOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
  } as const;

  res.clearCookie("accessToken", { ...clearOptions, path: "/" });
  res.clearCookie("refreshToken", { ...clearOptions, path: refreshPath });
}
