import { Injectable, Logger } from "@nestjs/common";

/**
 * Servicio principal de la aplicación
 *
 * Este servicio proporciona funcionalidades básicas para el estado de la aplicación
 * y puede ser utilizado para verificar si la API está funcionando correctamente.
 *
 * @example
 * ```typescript
 * // Verificar el estado de la aplicación
 * const status = await appService.getStatus();
 * console.log(status); // 'Online!'
 * ```
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  /**
   * Obtiene el estado actual de la aplicación
   *
   * Este método verifica si la aplicación está funcionando correctamente
   * y registra la acción en los logs para monitoreo.
   *
   * @returns {string} Mensaje indicando que la aplicación está en línea
   *
   * @example
   * ```typescript
   * const status = appService.getStatus();
   * // Retorna: 'Online!'
   * ```
   */
  getStatus(): string {
    this.logger.log("getStatus");
    return "Online!";
  }
}
