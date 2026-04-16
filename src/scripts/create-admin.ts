import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { UserRepository } from "@/repositories/user.repository";
import { AccountStatus, UserRole } from "@/commons/enums";

async function createAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepository = app.get<UserRepository>(UserRepository);

    // Verificar si ya existe un usuario director
    const existingDirector = await userRepository.findByRole(UserRole.DIRECTOR);

    if (existingDirector.length > 0) {
      console.log("✅ Ya existe un usuario director en el sistema");
      return;
    }

    // Crear usuario administrador por defecto
    const adminUser = userRepository.create({
      firstName: "Administrador",
      lastName: "Sistema",
      email: "admin@andamiaje.com",
      documentNumber: "000000001",
      phone: "0000000000",
      password: "admin123",
      role: UserRole.DIRECTOR,
      accountStatus: AccountStatus.ACTIVE,
    });

    await userRepository.save(adminUser);

    console.log("✅ Usuario administrador creado exitosamente");
    console.log("📧 Email: admin@andamiaje.com");
    console.log("👤 Usuario: admin");
    console.log("🔑 Contraseña: admin123");
    console.log(
      "⚠️  IMPORTANTE: Cambia la contraseña después del primer login",
    );
  } catch (error) {
    console.error("❌ Error al crear usuario administrador:", error.message);
  } finally {
    await app.close();
  }
}

createAdminUser().catch(console.error);
