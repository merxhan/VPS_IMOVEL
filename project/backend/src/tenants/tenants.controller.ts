import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('api/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.tenantsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.tenantsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
