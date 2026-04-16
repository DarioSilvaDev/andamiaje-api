import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DataSource } from "typeorm";
import { OwnerCheck, OwnerGuard } from "./owner.guard";
import { UserRole } from "@/commons/enums";

describe("OwnerGuard", () => {
  let guard: OwnerGuard;
  let reflector: jest.Mocked<Reflector>;
  let dataSource: jest.Mocked<DataSource>;
  let repository: { findOne: jest.Mock };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    repository = {
      findOne: jest.fn(),
    };

    dataSource = {
      getRepository: jest.fn().mockReturnValue(repository),
    } as unknown as jest.Mocked<DataSource>;

    guard = new OwnerGuard(reflector, dataSource);
  });

  const buildContext = (request: any): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  it("allows directors without querying ownership", async () => {
    reflector.getAllAndOverride.mockReturnValue({
      entity: class FormEntity {},
      idField: "id",
      ownerField: "createdBy.id",
      relations: ["createdBy"],
    } as OwnerCheck);

    const context = buildContext({
      user: { id: 99, role: UserRole.DIRECTOR },
      params: { id: "10" },
      body: {},
      query: {},
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it("blocks access when user is not owner", async () => {
    reflector.getAllAndOverride.mockReturnValue({
      entity: class FormEntity {},
      idField: "id",
      ownerField: "createdBy.id",
      relations: ["createdBy"],
    } as OwnerCheck);

    repository.findOne.mockResolvedValue({
      id: 10,
      createdBy: { id: 50 },
    });

    const context = buildContext({
      user: { id: 20, role: UserRole.TERAPEUTA },
      params: { id: "10" },
      body: {},
      query: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("allows access when ownership matches", async () => {
    reflector.getAllAndOverride.mockReturnValue({
      entity: class FormEntity {},
      idField: "id",
      ownerField: "createdBy.id",
      relations: ["createdBy"],
    } as OwnerCheck);

    repository.findOne.mockResolvedValue({
      id: 10,
      createdBy: { id: 20 },
    });

    const context = buildContext({
      user: { id: 20, role: UserRole.TERAPEUTA },
      params: { id: "10" },
      body: {},
      query: {},
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
