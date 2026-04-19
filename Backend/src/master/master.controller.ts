import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common';
import { MasterService } from './master.service';
import { MasterDto } from './dto/master.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';


@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @HttpCode(200)
  @Get()
  async getAll() {
    return this.masterService.getAll();
  }

  @HttpCode(200)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const master = await this.masterService.getById(id);

    if (!master) {
      throw new NotFoundException(`Мастер с ID ${id} не найден`);
    }

    return { data: master };
  }

  @Auth()
  @HttpCode(201)
  @Post()
  async create(@Body() dto: MasterDto) {
    return this.masterService.create(dto);
  }

  @Auth()
  @HttpCode(200)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMasterDto
  ) {
    return this.masterService.update(id, dto);
  }

  @Auth()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.masterService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Мастер с ID ${id} не найден`);
    }
    return { message: `Мастер с ID ${id} успешно удалён` };
  }
}
