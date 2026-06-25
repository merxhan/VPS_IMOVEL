import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from '../entities/documento.entity';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Documento])],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
