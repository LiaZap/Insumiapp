import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  alterarRoleSchema,
  criarUsuarioAdminSchema,
  type AlterarRoleInput,
  type CriarUsuarioAdminInput,
} from '@insumia/shared';
import { UsersService } from './users.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
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

  @Post()
  criar(
    @Req() req: AdminRequest,
    @Body(new ZodValidationPipe(criarUsuarioAdminSchema)) dto: CriarUsuarioAdminInput,
  ) {
    return this.users.criar(dto, req.user.id);
  }

  @Patch(':id/role')
  alterarRole(
    @Req() req: AdminRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(alterarRoleSchema)) dto: AlterarRoleInput,
  ) {
    return this.users.alterarRole(id, dto.role, req.user.id);
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
