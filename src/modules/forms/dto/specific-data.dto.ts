import {
  registerDecorator,
  ValidationArguments,
  ValidationError,
} from "class-validator";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { SpecificFormDtoMap } from "./create-form.dto";

/**
 * Valida que el objeto `specificData` corresponda al DTO según el type seleccionado.
 * Traduce todos los errores al español, incluyendo propiedades extra.
 */
export function SpecificDataType() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: "SpecificDataType",
      target: object.constructor,
      propertyName,
      options: {
        message:
          "El campo 'specificData' no coincide con el tipo de formulario seleccionado",
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const type = (args.object as any).type;
          const dtoClass = SpecificFormDtoMap[type];

          if (!dtoClass) return false; // tipo no definido en el mapa

          // Convertimos el objeto plain a instancia del DTO correspondiente
          const instance = plainToInstance(dtoClass, value);

          // Validamos la instancia con whitelist + forbidNonWhitelisted
          const errors = validateSync(instance, {
            whitelist: true,
            forbidNonWhitelisted: true,
          });

          // Reemplaza todos los mensajes de propiedades extra en español
          const translateErrors = (errs: ValidationError[]) => {
            errs.forEach((err) => {
              if (!err.children) err.children = [];

              if (err.constraints) {
                Object.keys(err.constraints).forEach((key) => {
                  if (key === "whitelistValidation") {
                    err.constraints[key] =
                      `La propiedad '${err.property}' no corresponde al tipo de formulario seleccionado`;
                  }
                  // Opcional: aquí puedes traducir otros mensajes automáticamente si quieres
                });
              }

              if (err.children && err.children.length) {
                translateErrors(err.children);
              }
            });
          };

          translateErrors(errors);

          // Guardamos los errores en el objeto para que ValidationPipe los procese
          (args.object as any).__specificDataErrors = errors;

          return errors.length === 0;
        },

        defaultMessage(args: ValidationArguments) {
          return "El campo 'specificData' no coincide con el tipo de formulario seleccionado";
        },
      },
    });
  };
}
