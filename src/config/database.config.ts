// import { DataSource } from "typeorm";
// import { envs } from "./envs";
// import { User } from "@/entities/user.entity";
// import { Document } from "@/entities/document.entity";
// // import { DocumentFile } from "@/entities/document-file.entity";

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: envs.DB_HOST,
//   port: envs.DB_PORT,
//   username: envs.DB_USERNAME,
//   password: envs.DB_PASSWORD,
//   database: envs.DB_DATABASE,
//   synchronize: envs.DB_SYNCHRONIZE,
//   logging: envs.DB_LOGGING,
//   entities: [User, Document, DocumentFile],
//   // migrations: ["src/migrations/**/*.ts"],
//   // subscribers: ["src/subscribers/**/*.ts"],
//   ssl: envs.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
// });

// export default AppDataSource;
