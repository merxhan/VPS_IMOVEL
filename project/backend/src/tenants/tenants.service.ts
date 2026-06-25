import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Inquilino } from '../entities/inquilino.entity';
import { Documento } from '../entities/documento.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Inquilino)
    private inquilinoRepo: Repository<Inquilino>,
    @InjectRepository(Documento)
    private docRepo: Repository<Documento>,
  ) {}

  async findAll(search?: string) {
    const queryBuilder = this.inquilinoRepo
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.property', 'property')
      .leftJoinAndSelect('tenant.documents', 'documents');

    if (search) {
      queryBuilder.where(
        'tenant.name ILIKE :search OR tenant.email ILIKE :search OR tenant.documentValue ILIKE :search',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const tenant = await this.inquilinoRepo.findOne({
      where: { id },
      relations: ['property', 'documents'],
    });
    if (!tenant) throw new NotFoundException('Inquilino no encontrado');
    return tenant;
  }

  async create(data: any) {
    // Verificar unicidad de documentValue
    const existing = await this.inquilinoRepo.findOne({ where: { documentValue: data.documentValue } });
    if (existing) {
      throw new BadRequestException('El número de documento ya está registrado.');
    }

    const newTenant = this.inquilinoRepo.create(data);
    return this.inquilinoRepo.save(newTenant);
  }

  async update(id: string, data: any) {
    await this.findOne(id); // verifica existencia
    
    // Si cambia el documentValue, verificar unicidad
    if (data.documentValue) {
      const existing = await this.inquilinoRepo.findOne({ where: { documentValue: data.documentValue } });
      if (existing && existing.id !== id) {
        throw new BadRequestException('El número de documento ya está registrado en otro inquilino.');
      }
    }

    await this.inquilinoRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);
    return this.inquilinoRepo.remove(tenant);
  }

  async addDocument(tenantId: string, file: Express.Multer.File) {
    const tenant = await this.findOne(tenantId);
    const doc = this.docRepo.create({
      name: file.originalname,
      filePath: file.filename,
      mimeType: file.mimetype,
      fileSize: file.size,
      tenantId,
    });
    return this.docRepo.save(doc);
  }
}
