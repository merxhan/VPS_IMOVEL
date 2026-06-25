import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inmueble } from '../entities/inmueble.entity';
import { Documento } from '../entities/documento.entity';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inmueble, Documento])],
  controllers: [PropertiesController],
  providers: [PropertiesService]
})
export class PropertiesModule {}
