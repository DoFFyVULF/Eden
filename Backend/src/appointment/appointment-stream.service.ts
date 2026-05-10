import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Appointment } from 'generated/prisma/client';
import { Response } from 'express';

@Injectable()
export class AppointmentStreamService implements OnModuleDestroy {
  private clients = new Map<string, Response>();
  private heartbeatTimer = setInterval(() => {
    this.broadcast('ping', { timestamp: new Date().toISOString() });
  }, 25000);

  onModuleDestroy() {
    clearInterval(this.heartbeatTimer);
    this.clients.clear();
  }

  registerClient(response: Response) {
    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    this.clients.set(clientId, response);

    this.writeEvent(response, 'connected', {
      clientId,
      timestamp: new Date().toISOString(),
    });

    return clientId;
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
  }

  emitNewAppointment(appointment: Appointment) {
    this.broadcast('new-appointment', appointment);
  }

  private broadcast(event: string, payload: unknown) {
    for (const [clientId, response] of this.clients.entries()) {
      try {
        this.writeEvent(response, event, payload);
      } catch {
        this.clients.delete(clientId);
        response.end();
      }
    }
  }

  private writeEvent(response: Response, event: string, payload: unknown) {
    response.write(`event: ${event}\n`);
    response.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
}
