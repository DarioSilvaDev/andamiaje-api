import { Response } from "express";

/**
 * Configura cookies de autenticación (access y refresh) según el entorno.
 * - En local: no usa `secure` y aplica SameSite "lax" (permite HTTP).
 * - En producción: usa `secure` y SameSite "none" (requerido para HTTPS cross-domain).
 */
export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; expiresIn: number }
) {
  console.log(
    "🚀 ~ setAuthCookies ~ res.req.headers.origin:",
    res.req.headers.origin
  );
  const origin = res.req.headers.origin as string;
  const isFrontLocal = origin?.includes("localhost");

  const cookieOptionsBase = {
    httpOnly: true,
    sameSite: isFrontLocal ? "lax" : "none",
    secure: !isFrontLocal,
  } as const;

  // Access Token cookie
  res.cookie("accessToken", tokens.accessToken, {
    ...cookieOptionsBase,
    maxAge: tokens.expiresIn * 1000, // en ms
  });

  // Refresh Token cookie (por ejemplo, 7 días)
  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptionsBase,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

/**
 * Limpia las cookies de autenticación del usuario (logout).
 */
export function clearAuthCookies(res: Response) {
  // const isProd = process.env.NODE_ENV === "production";
  const isFrontLocal = process.env.ALLOWEDORIGINSPROD?.includes("localhost");

  const clearOptions = {
    httpOnly: true,
    sameSite: isFrontLocal ? "lax" : "none",
    secure: !isFrontLocal,
  } as const;

  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
}
