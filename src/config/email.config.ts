import { MailerOptions } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { envs } from "./envs";
import * as path from "path";

/**
 * Configuración del servicio de email usando Nodemailer
 */
export const emailConfig: MailerOptions = {
  transport: envs.MAIL_SERVICE
    ? {
        service: envs.MAIL_SERVICE, // 'gmail', 'outlook', etc.
        auth: {
          user: envs.MAIL_USER,
          pass: envs.MAIL_PASSWORD,
        },
      }
    : {
        host: "sandbox.smtp.mailtrap.io", //envs.MAIL_HOST,
        port: 2525, //envs.MAIL_PORT,
        secure: envs.MAIL_SECURE,
        auth: {
          user: "8a26216375706a", //envs.MAIL_USER,
          pass: "740fb2477e799a", //envs.MAIL_PASSWORD,
        },
      },
  defaults: {
    from: `"${envs.MAIL_FROM_NAME}" <${envs.MAIL_FROM_ADDRESS}>`,
  },
  template: {
    dir: path.join(__dirname, "..", "modules", "email", "templates"),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
