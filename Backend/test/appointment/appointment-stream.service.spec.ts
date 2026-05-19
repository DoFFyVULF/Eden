import { AppointmentStreamService } from 'src/appointment/appointment-stream.service';

describe('AppointmentStreamService', () => {
  let service: AppointmentStreamService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new AppointmentStreamService();
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const createResponse = () =>
    ({
      write: jest.fn(),
      end: jest.fn(),
    }) as any;

  it('should register client and send connected event', () => {
    const response = createResponse();
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

    const clientId = service.registerClient(response);

    expect(clientId).toBe('1234567890-4fzzzxjy');
    expect(response.write).toHaveBeenNthCalledWith(1, 'event: connected\n');
    expect(response.write).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('"clientId":"1234567890-4fzzzxjy"')
    );
  });

  it('should remove a client explicitly', () => {
    const response = createResponse();
    const clientId = service.registerClient(response);

    service.removeClient(clientId);
    service.emitNewAppointment({ id: 1 } as any);

    expect(response.write).toHaveBeenCalledTimes(2);
  });

  it('should broadcast new appointments to all clients', () => {
    const firstResponse = createResponse();
    const secondResponse = createResponse();

    service.registerClient(firstResponse);
    service.registerClient(secondResponse);

    service.emitNewAppointment({ id: 77, clientName: 'Ivan' } as any);

    expect(firstResponse.write).toHaveBeenLastCalledWith(
      'data: {"id":77,"clientName":"Ivan"}\n\n'
    );
    expect(secondResponse.write).toHaveBeenLastCalledWith(
      'data: {"id":77,"clientName":"Ivan"}\n\n'
    );
  });

  it('should drop broken clients during broadcast', () => {
    const brokenResponse = createResponse();
    brokenResponse.write
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => {
        throw new Error('socket closed');
      });

    service.registerClient(brokenResponse);
    service.emitNewAppointment({ id: 5 } as any);
    service.emitNewAppointment({ id: 6 } as any);

    expect(brokenResponse.end).toHaveBeenCalled();
    expect(brokenResponse.write).toHaveBeenCalledTimes(3);
  });

  it('should emit heartbeat events on interval', () => {
    const response = createResponse();
    service.registerClient(response);
    response.write.mockClear();

    jest.advanceTimersByTime(25000);

    expect(response.write).toHaveBeenNthCalledWith(1, 'event: ping\n');
    expect(response.write).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('"timestamp"')
    );
  });

  it('should clear clients and stop heartbeat on destroy', () => {
    const response = createResponse();
    service.registerClient(response);
    response.write.mockClear();

    service.onModuleDestroy();
    jest.advanceTimersByTime(25000);
    service.emitNewAppointment({ id: 8 } as any);

    expect(response.write).not.toHaveBeenCalled();
  });
});
