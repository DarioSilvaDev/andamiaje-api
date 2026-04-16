import "dotenv/config";
import { DataSource } from "typeorm";
import {
  ActaForm,
  AdmissionForm,
  CompanionFollowupForm,
  Document,
  FamilyFollowupForm,
  FormEntity,
  FormReviewAudit,
  InvoiceForm,
  MonthlyReportForm,
  PlanForm,
  SemestralReportForm,
  User,
} from "../entities";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL no esta configurada para migraciones");
}

const isProduction = process.env.NODE_ENV === "production";
const dbSslEnabled = process.env.DB_SSL !== "false";
const dbLoggingEnabled = process.env.DB_LOGGING === "true";

const AppDataSource = new DataSource({
  type: "postgres",
  url: databaseUrl,
  ssl: dbSslEnabled ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: dbLoggingEnabled,
  entities: [
    ActaForm,
    AdmissionForm,
    CompanionFollowupForm,
    Document,
    FamilyFollowupForm,
    FormEntity,
    FormReviewAudit,
    InvoiceForm,
    MonthlyReportForm,
    PlanForm,
    SemestralReportForm,
    User,
  ],
  migrations: [isProduction ? "dist/migrations/*.js" : "src/migrations/*.ts"],
  migrationsTableName: "typeorm_migrations",
});

export default AppDataSource;
