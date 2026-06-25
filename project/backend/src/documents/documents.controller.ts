import { Controller, Get, Post, Param, UseInterceptors, UploadedFile, Res, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Documento } from '../entities/documento.entity';
import { Inmueble } from '../entities/inmueble.entity';
import { Inquilino } from '../entities/inquilino.entity';

const UPLOADS_DIR = join(process.cwd(), 'uploads');
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

@Controller('api')
export class DocumentsController {
  constructor(
    @InjectRepository(Documento)
    private docRepo: Repository<Documento>,
    @InjectRepository(Inmueble)
    private propRepo: Repository<Inmueble>,
    @InjectRepository(Inquilino)
    private tenantRepo: Repository<Inquilino>,
  ) {}

  @Post('properties/:id/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Somente arquivos PDF são aceitos.'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadPropertyDoc(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    const property = await this.propRepo.findOne({ where: { id } });
    if (!property) throw new NotFoundException('Imóvel não encontrado.');

    const doc = this.docRepo.create({
      name: file.originalname,
      filePath: file.filename,
      mimeType: file.mimetype,
      fileSize: file.size,
      propertyId: id,
    });

    return this.docRepo.save(doc);
  }

  @Post('tenants/:id/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Somente arquivos PDF são aceitos.'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadTenantDoc(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Inquilino não encontrado.');

    const doc = this.docRepo.create({
      name: file.originalname,
      filePath: file.filename,
      mimeType: file.mimetype,
      fileSize: file.size,
      tenantId: id,
    });

    return this.docRepo.save(doc);
  }

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
