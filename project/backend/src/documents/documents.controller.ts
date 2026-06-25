import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Documento } from '../entities/documento.entity';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

@Controller('api')
export class DocumentsController {
  constructor(
    @InjectRepository(Documento)
    private docRepo: Repository<Documento>,
  ) {}

  @Get('documents/download/:filePath')
  async downloadDoc(
    @Param('filePath') filePath: string,
    @Res() res: Response,
  ) {
    const fullPath = join(UPLOADS_DIR, filePath);
    if (!existsSync(fullPath)) {
      throw new NotFoundException('Arquivo não encontrado.');
    }
    const doc = await this.docRepo.findOne({ where: { filePath } });
    const displayName = doc ? doc.name : 'documento.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(displayName)}"`);
    res.sendFile(fullPath);
  }
}
