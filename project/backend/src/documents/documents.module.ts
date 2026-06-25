import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from '../entities/documento.entity';
import { Inmueble } from '../entities/inmueble.entity';
import { Inquilino } from '../entities/inquilino.entity';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Documento, Inmueble, Inquilino])],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
