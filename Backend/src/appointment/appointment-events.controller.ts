import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'generated/prisma/enums';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { AppointmentStreamService } from './appointment-stream.service';

@Controller('appointment-events')
export class AppointmentEventsController {
  constructor(
    private readonly streamService: AppointmentStreamService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  @Get('stream')
  async stream(@Req() request: Request, @Res() response: Response) {
    const token = this.getTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    const payload = await this.jwtService
      .verifyAsync<{ id: number }>(token)
      .catch(() => {
        throw new UnauthorizedException('Invalid access token');
      });

    const user = await this.userService.getById(payload.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role !== Role.admin) {
      throw new ForbiddenException('Only admins can access appointment stream');
    }

    response.status(200);
    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no');

    if (typeof response.flushHeaders === 'function') {
      response.flushHeaders();
    }

    response.write('retry: 5000\n\n');

    const clientId = this.streamService.registerClient(response);

    request.on('close', () => {
      this.streamService.removeClient(clientId);
      response.end();
    });
  }

  private getTokenFromRequest(request: Request) {
    const queryToken = request.query.token;

    if (typeof queryToken === 'string' && queryToken.trim()) {
      return queryToken;
    }

    const cookieToken = request.cookies?.accessToken;

    if (typeof cookieToken === 'string' && cookieToken.trim()) {
      return cookieToken;
    }

    return null;
  }
}
