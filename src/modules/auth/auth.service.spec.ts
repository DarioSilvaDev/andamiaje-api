import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { UserRepository } from "@/repositories/user.repository";
import { NotificationsService } from "../notifications/notifications.service";
import { AccountStatus, UserRole } from "@/commons/enums";

jest.mock("@/config/envs", () => ({
  envs: {
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "15m",
    JWT_REFRESH_SECRET: "test-refresh-secret",
    JWT_REFRESH_EXPIRES_IN: "7d",
  },
}));

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let notificationsService: jest.Mocked<NotificationsService>;

  beforeEach(() => {
    userRepository = {
      findByDocumentNumber: jest.fn(),
      updateLastLogin: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
      findByRole: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    notificationsService = {
      notifyDirectorsNewRegistration: jest.fn(),
      sendWelcomeEmail: jest.fn(),
    } as unknown as jest.Mocked<NotificationsService>;

    service = new AuthService(userRepository, jwtService, notificationsService);
  });

  it("rejects login for pending approval users", async () => {
    const user = {
      id: 1,
      documentNumber: "123456789",
      accountStatus: AccountStatus.PENDING_APPROVAL,
      validatePassword: jest.fn().mockResolvedValue(true),
    } as any;

    userRepository.findByDocumentNumber.mockResolvedValue(user);

    await expect(service.validateUser("123456789", "secret")).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("rotates refresh token when refresh is valid", async () => {
    const oldRefresh = "old-refresh-token";
    const refreshTokenHash = await bcrypt.hash(oldRefresh, 10);

    const user = {
      id: 7,
      role: UserRole.DIRECTOR,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      accountStatus: AccountStatus.ACTIVE,
      documentNumber: "123456789",
      firstLogin: false,
      digitalSignature: "firmas/123456789-signature.png",
      phone: "1234567890",
      refreshTokenHash,
    } as any;

    jwtService.verify.mockReturnValue({ sub: user.id } as any);
    userRepository.findOne.mockResolvedValue(user);
    jwtService.sign
      .mockReturnValueOnce("new-access-token")
      .mockReturnValueOnce("new-refresh-token");

    const response = await service.refreshToken(oldRefresh);

    expect(response.accessToken).toBe("new-access-token");
    expect(response.refreshToken).toBe("new-refresh-token");
    expect(userRepository.update).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({ refreshTokenHash: expect.any(String) }),
    );
  });

  it("revokes session when refresh token hash does not match", async () => {
    const user = {
      id: 3,
      role: UserRole.TERAPEUTA,
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      accountStatus: AccountStatus.ACTIVE,
      documentNumber: "123456789",
      firstLogin: false,
      digitalSignature: "firmas/123456789-signature.png",
      phone: "1234567890",
      refreshTokenHash: await bcrypt.hash("different-token", 10),
    } as any;

    jwtService.verify.mockReturnValue({ sub: user.id } as any);
    userRepository.findOne.mockResolvedValue(user);

    await expect(service.refreshToken("invalid-token")).rejects.toThrow(
      UnauthorizedException,
    );

    expect(userRepository.update).toHaveBeenCalledWith(user.id, {
      refreshTokenHash: null,
    });
  });
});
