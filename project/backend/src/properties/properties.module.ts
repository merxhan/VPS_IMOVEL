import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inmueble } from '../entities/inmueble.entity';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inmueble])],
  controllers: [PropertiesController],
  providers: [PropertiesService]
})
export class PropertiesModule {}
