import { Controller, Delete, Get, HttpCode, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.listAll();
  }

  @Patch(':id/bloquear')
  toggleBloqueio(@Param('id') id: string, @Req() req: AdminRequest) {
    return this.users.toggleBloqueio(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @Req() req: AdminRequest) {
    await this.users.delete(id, req.user.id);
  }
}
