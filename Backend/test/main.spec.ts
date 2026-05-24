jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('cookie-parser', () => jest.fn(() => 'cookie-parser-middleware'));

describe('main bootstrap', () => {
  const mockApp = {
    setGlobalPrefix: jest.fn(),
    use: jest.fn(),
    enableCors: jest.fn(),
    useGlobalPipes: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should bootstrap application with expected setup', async () => {
    const { NestFactory } = await import('@nestjs/core');
    const cookieParser = (await import('cookie-parser')).default;

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    await import('../src/main');
    await new Promise(process.nextTick);

    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(mockApp.use).toHaveBeenCalledWith('cookie-parser-middleware');
    expect(cookieParser).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalled();
  });
});
