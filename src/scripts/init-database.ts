/**
 * Script para inicializar la base de datos con la nueva arquitectura v2
 *
 * Este script debe ejecutarse SOLO en desarrollo/pruebas
 *
 * Uso:
 *   npm run build
 *   node dist/scripts/init-database.js
 */

import AppDataSource from "../config/typeorm.config";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("🔧 Script de Inicialización de Base de Datos");
  console.log("============================================\n");

  try {
    // Advertencia
    console.log("⚠️  ADVERTENCIA:");
    console.log(
      "   Este script debe ejecutarse SOLO en entornos de desarrollo/pruebas."
    );
    console.log("   NO ejecutar en producción.\n");

    const env = process.env.NODE_ENV || "development";
    console.log(`📌 Entorno actual: ${env}\n`);

    if (env === "production") {
      console.error("❌ ERROR: Este script NO debe ejecutarse en producción.");
      console.error(
        "   Use migraciones para producción: npm run migration:run"
      );
      process.exit(1);
    }

    // Confirmar ejecución
    const confirm = await question(
      "¿Deseas continuar con la inicialización? (yes/no): "
    );

    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Operación cancelada.");
      process.exit(0);
    }

    console.log("\n🔌 Conectando a la base de datos...");
    await AppDataSource.initialize();
    console.log("✅ Conectado exitosamente.\n");

    // Verificar estado de migraciones
    console.log("📊 Verificando estado de migraciones...");
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      // Verificar si la tabla de migraciones existe
      const hasMigrationsTable =
        await queryRunner.hasTable("typeorm_migrations");

      if (hasMigrationsTable) {
        const migrations = await queryRunner.query(
          "SELECT * FROM typeorm_migrations ORDER BY timestamp DESC"
        );

        if (migrations.length > 0) {
          console.log(`✅ ${migrations.length} migración(es) ejecutada(s):`);
          migrations.forEach((m: any) => {
            console.log(
              `   - ${m.name} (${new Date(m.timestamp).toLocaleString()})`
            );
          });
        } else {
          console.log("⚠️  No hay migraciones ejecutadas.");
        }
      } else {
        console.log(
          "⚠️  Tabla de migraciones no existe. Se creará con la primera migración."
        );
      }
    } finally {
      await queryRunner.release();
    }

    console.log("\n📋 Opciones disponibles:");
    console.log("   1. Ejecutar migraciones pendientes");
    console.log("   2. Sincronizar esquema (⚠️  elimina y recrea todo)");
    console.log("   3. Salir");

    const option = await question("\nSelecciona una opción (1-3): ");

    switch (option) {
      case "1":
        console.log("\n🚀 Ejecutando migraciones pendientes...");
        await AppDataSource.runMigrations();
        console.log("✅ Migraciones ejecutadas correctamente.");
        break;

      case "2":
        const confirmSync = await question(
          "\n⚠️  ADVERTENCIA: Esto eliminará TODOS los datos.\n" +
            "¿Estás seguro de que deseas sincronizar el esquema? (yes/no): "
        );

        if (confirmSync.toLowerCase() === "yes") {
          console.log("\n🔄 Sincronizando esquema...");
          await AppDataSource.synchronize(true); // true = drop existing schema
          console.log("✅ Esquema sincronizado correctamente.");
        } else {
          console.log("❌ Sincronización cancelada.");
        }
        break;

      case "3":
        console.log("👋 Saliendo...");
        break;

      default:
        console.log("❌ Opción inválida.");
        break;
    }

    // Mostrar estado final
    console.log("\n📊 Estado final de la base de datos:");
    const tables = await AppDataSource.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

    console.log(`✅ ${tables.length} tabla(s) en la base de datos:`);
    tables.forEach((t: any) => {
      console.log(`   - ${t.tablename}`);
    });

    console.log("\n✅ Inicialización completada exitosamente.");
  } catch (error) {
    console.error("\n❌ Error durante la inicialización:");
    console.error(error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("\n🔌 Desconectado de la base de datos.");
    }
    rl.close();
    process.exit(0);
  }
}

// Ejecutar script
main();
