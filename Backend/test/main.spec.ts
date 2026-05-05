jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('../src/seed/admin.seed', () => ({
  createDefaultAdmin: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('cookie-parser', () => jest.fn(() => 'cookie-parser-middleware'));

describe('main bootstrap', () => {
  const mockApp = {
    setGlobalPrefix: jest.fn(),
    use: jest.fn(),
    enableCors: jest.fn(),
    useGlobalPipes: jest.fn(),
    get: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should bootstrap application with expected setup', async () => {
    const { NestFactory } = await import('@nestjs/core');
    const { createDefaultAdmin } = await import('../src/seed/admin.seed');
    const cookieParser = (await import('cookie-parser')).default;

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    mockApp.get.mockReturnValue({ token: 'prisma' });

    await import('../src/main');
    await new Promise(process.nextTick);

    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(mockApp.use).toHaveBeenCalledWith('cookie-parser-middleware');
    expect(cookieParser).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalled();
    expect(createDefaultAdmin).toHaveBeenCalledWith({ token: 'prisma' });
    expect(mockApp.listen).toHaveBeenCalled();
  });
});
