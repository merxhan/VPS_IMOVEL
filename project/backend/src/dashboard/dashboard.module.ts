import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Inmueble } from '../entities/inmueble.entity';
import { Inquilino } from '../entities/inquilino.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inmueble, Inquilino])],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
