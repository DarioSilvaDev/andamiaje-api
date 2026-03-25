import { DataSource, DataSourceOptions } from "typeorm";
import { envs } from "./envs";

// Importar todas las entidades
import { User } from "@/entities/user.entity";
import { BaseForm } from "@/entities/base/base-form.entity";
import { FormAuditLog } from "@/entities/base/form-audit-log.entity";
import { FormNotification } from "@/entities/base/form-notification.entity";
import { ActaFormV2 } from "@/entities/forms/acta-form-v2.entity";
import { AdmissionFormV2 } from "@/entities/forms/admission-form-v2.entity";
import { PlanFormV2 } from "@/entities/forms/plan-form-v2.entity";
import { SemestralReportFormV2 } from "@/entities/forms/semestral-report-form-v2.entity";
import { MonthlyReportFormV2 } from "@/entities/forms/monthly-report-form-v2.entity";
import { AccompanimentFollowUpFormV2 } from "@/entities/forms/accompaniment-followup-form-v2.entity";
import { FamilyFollowUpFormV2 } from "@/entities/forms/family-followup-form-v2.entity";
import { InvoiceFormV2 } from "@/entities/forms/invoice-form-v2.entity";

console.log("🚀 ~ envs.DATABASE_URL:", envs.DATABASE_URL);
export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  url: envs.DATABASE_URL,

  // Entidades v2
  entities: [
    // Usuario
    User,

    // Base Forms v2
    BaseForm,
    FormAuditLog,
    FormNotification,

    // Formularios específicos v2
    ActaFormV2,
    AdmissionFormV2,
    PlanFormV2,
    SemestralReportFormV2,
    MonthlyReportFormV2,
    AccompanimentFollowUpFormV2,
    FamilyFollowUpFormV2,
    InvoiceFormV2,
  ],

  // Migraciones
  migrations: ["dist/migrations/**/*.js"],
  migrationsTableName: "typeorm_migrations",
  migrationsRun: false, // No ejecutar automáticamente

  // Configuración
  synchronize: true, // SIEMPRE false - usar migraciones
  logging: envs.NODE_ENV === "development", // Solo en desarrollo

  // SSL solo en producción
  ssl: envs.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,

  // Pool de conexiones
  extra: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

// DataSource para migraciones CLI
const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
