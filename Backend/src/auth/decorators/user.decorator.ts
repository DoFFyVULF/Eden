import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: number;
  name: string;
  role: string;
  masterId?: number;
  isActive: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload, ctx: ExecutionContext): CurrentUserPayload | CurrentUserPayload[keyof CurrentUserPayload] => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUserPayload = request.user;

    return data ? user[data] : user;
  },
);