import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { MasterUserController } from './master.controller';

@Module({
  controllers: [UserController, MasterUserController],
  providers: [UserService, PrismaService],
  exports: [UserService]
})
export class UserModule {}
