import { PrismaService } from '../src/prisma.service';

describe('PrismaService', () => {
  it('should call $connect on module init', async () => {
    const service = new PrismaService();
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined as never);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });
});
