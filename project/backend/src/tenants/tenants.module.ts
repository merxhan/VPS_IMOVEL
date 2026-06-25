import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquilino } from '../entities/inquilino.entity';
import { Documento } from '../entities/documento.entity';
import { Inmueble } from '../entities/inmueble.entity';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inquilino, Documento, Inmueble])],
  controllers: [TenantsController],
  providers: [TenantsService]
})
export class TenantsModule {}
