import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'generated/prisma/enums';
import { AppointmentEventsController } from 'src/appointment/appointment-events.controller';
import { AppointmentStreamService } from 'src/appointment/appointment-stream.service';
import { UserService } from 'src/user/user.service';

describe('AppointmentEventsController', () => {
  let controller: AppointmentEventsController;

  const mockStreamService = {
    registerClient: jest.fn(),
    removeClient: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockUserService = {
    getById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentEventsController],
      providers: [
        {
          provide: AppointmentStreamService,
          useValue: mockStreamService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentEventsController>(AppointmentEventsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createResponse = () => {
    const headers = new Map<string, string>();
    return {
      status: jest.fn(),
      setHeader: jest.fn((key: string, value: string) => {
        headers.set(key, value);
      }),
      flushHeaders: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      headers,
    };
  };

  const createRequest = (overrides?: Partial<any>) => {
    const listeners = new Map<string, () => void>();
    return {
      query: {},
      cookies: {},
      on: jest.fn((event: string, callback: () => void) => {
        listeners.set(event, callback);
      }),
      listeners,
      ...overrides,
    };
  };

  it('should stream events for admin using query token', async () => {
    const request = createRequest({
      query: { token: 'query-token' },
    });
    const response = createResponse();

    mockJwtService.verifyAsync.mockResolvedValue({ id: 7 });
    mockUserService.getById.mockResolvedValue({ id: 7, role: Role.admin });
    mockStreamService.registerClient.mockReturnValue('client-1');

    await controller.stream(request as any, response as any);

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('query-token');
    expect(mockUserService.getById).toHaveBeenCalledWith(7);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/event-stream; charset=utf-8'
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-cache, no-transform'
    );
    expect(response.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    expect(response.setHeader).toHaveBeenCalledWith('X-Accel-Buffering', 'no');
    expect(response.flushHeaders).toHaveBeenCalled();
    expect(response.write).toHaveBeenCalledWith('retry: 5000\n\n');
    expect(mockStreamService.registerClient).toHaveBeenCalledWith(response);
    expect(request.on).toHaveBeenCalledWith('close', expect.any(Function));

    const closeHandler = request.listeners.get('close');
    expect(closeHandler).toBeDefined();

    closeHandler?.();

    expect(mockStreamService.removeClient).toHaveBeenCalledWith('client-1');
    expect(response.end).toHaveBeenCalled();
  });

  it('should use cookie token and skip flushHeaders when unavailable', async () => {
    const request = createRequest({
      cookies: { accessToken: 'cookie-token' },
    });
    const response = createResponse();
    delete (response as any).flushHeaders;

    mockJwtService.verifyAsync.mockResolvedValue({ id: 8 });
    mockUserService.getById.mockResolvedValue({ id: 8, role: Role.admin });
    mockStreamService.registerClient.mockReturnValue('client-2');

    await controller.stream(request as any, response as any);

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('cookie-token');
    expect(mockStreamService.registerClient).toHaveBeenCalledWith(response);
  });

  it('should throw when token is missing', async () => {
    const request = createRequest();
    const response = createResponse();

    await expect(controller.stream(request as any, response as any)).rejects.toThrow(
      new UnauthorizedException('Access token is required')
    );
  });

  it('should throw when token is invalid', async () => {
    const request = createRequest({
      query: { token: 'bad-token' },
    });
    const response = createResponse();

    mockJwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

    await expect(controller.stream(request as any, response as any)).rejects.toThrow(
      new UnauthorizedException('Invalid access token')
    );
  });

  it('should throw when user is missing', async () => {
    const request = createRequest({
      query: { token: 'query-token' },
    });
    const response = createResponse();

    mockJwtService.verifyAsync.mockResolvedValue({ id: 9 });
    mockUserService.getById.mockResolvedValue(null);

    await expect(controller.stream(request as any, response as any)).rejects.toThrow(
      new UnauthorizedException('User not found')
    );
  });

  it('should throw when user is not admin', async () => {
    const request = createRequest({
      query: { token: 'query-token' },
    });
    const response = createResponse();

    mockJwtService.verifyAsync.mockResolvedValue({ id: 10 });
    mockUserService.getById.mockResolvedValue({ id: 10, role: Role.master });

    await expect(controller.stream(request as any, response as any)).rejects.toThrow(
      new ForbiddenException('Only admins can access appointment stream')
    );
  });
});
