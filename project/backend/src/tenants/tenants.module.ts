import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquilino } from '../entities/inquilino.entity';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inquilino])],
  controllers: [TenantsController],
  providers: [TenantsService]
})
export class TenantsModule {}
