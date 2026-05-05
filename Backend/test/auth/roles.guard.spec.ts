import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/enums';
import { RolesGuard } from '../../src/auth/guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { get: jest.Mock };

  beforeEach(() => {
    reflector = { get: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  const createContext = (role: Role): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow request when no roles are required', () => {
    reflector.get.mockReturnValue(undefined);

    expect(guard.canActivate(createContext(Role.master))).toBe(true);
  });

  it('should allow request when user role is included', () => {
    reflector.get.mockReturnValue([Role.admin, Role.master]);

    expect(guard.canActivate(createContext(Role.master))).toBe(true);
  });

  it('should deny request when user role is not included', () => {
    reflector.get.mockReturnValue([Role.admin]);

    expect(guard.canActivate(createContext(Role.master))).toBe(false);
  });
});
