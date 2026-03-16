import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CurrentUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  create(
    @Body() dto: CreateReportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.create(dto, userId);
  }

  @Get('my')
  findMyReports(@CurrentUser('id') userId: string) {
    return this.reportsService.findMyReports(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'USER')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.reportsService.findOne(id, userId, userRole);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.reportsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }
}
