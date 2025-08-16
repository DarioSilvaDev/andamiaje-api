import { DataSource } from 'typeorm';
import { envs } from './envs';

export const AppDataSourceDev = new DataSource({
  type: 'postgres',
  host: envs.DB_HOST,
  port: envs.DB_PORT,
  username: envs.DB_USERNAME,
  password: envs.DB_PASSWORD,
  database: envs.DB_DATABASE,
  synchronize: false, // Deshabilitado en desarrollo para evitar problemas
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});

export default AppDataSourceDev; 