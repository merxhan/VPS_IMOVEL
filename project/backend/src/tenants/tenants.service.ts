import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquilino } from '../entities/inquilino.entity';
import { Documento } from '../entities/documento.entity';
import { Inmueble } from '../entities/inmueble.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Inquilino)
    private inquilinoRepo: Repository<Inquilino>,
    @InjectRepository(Documento)
    private docRepo: Repository<Documento>,
    @InjectRepository(Inmueble)
    private inmuebleRepo: Repository<Inmueble>,
  ) {}

  async findAll(search?: string) {
    const queryBuilder = this.inquilinoRepo
      .createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.properties', 'properties')
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
      relations: ['properties', 'documents'],
    });
    if (!tenant) throw new NotFoundException('Inquilino no encontrado');
    return tenant;
  }

  async create(data: any) {
    const { propertyIds, ...tenantData } = data;

    // Verificar unicidad de documentValue
    const existing = await this.inquilinoRepo.findOne({ where: { documentValue: tenantData.documentValue } });
    if (existing) {
      throw new BadRequestException('El número de documento ya está registrado.');
    }

    const newTenant = this.inquilinoRepo.create(tenantData as Inquilino);
    const savedTenant = await this.inquilinoRepo.save(newTenant);

    if (propertyIds && Array.isArray(propertyIds)) {
      for (const propId of propertyIds) {
        await this.inmuebleRepo.update(propId, {
          tenantId: savedTenant.id,
          status: 'ALQUILADO',
        });
      }
    }

    return this.findOne(savedTenant.id);
  }

  async update(id: string, data: any) {
    const { propertyIds, ...tenantData } = data;

    await this.findOne(id); // verifica existencia

    // Si cambia el documentValue, verificar unicidad
    if (tenantData.documentValue) {
      const existing = await this.inquilinoRepo.findOne({ where: { documentValue: tenantData.documentValue } });
      if (existing && existing.id !== id) {
        throw new BadRequestException('El número de documento ya está registrado en otro inquilino.');
      }
    }

    await this.inquilinoRepo.update(id, tenantData);

    if (propertyIds && Array.isArray(propertyIds)) {
      const currentProperties = await this.inmuebleRepo.find({ where: { tenantId: id } });

      // Unlink properties that are no longer selected
      const toUnlink = currentProperties.filter(p => !propertyIds.includes(p.id));
      for (const prop of toUnlink) {
        await this.inmuebleRepo.update(prop.id, {
          tenantId: null,
          status: 'DISPONIBLE',
        });
      }

      // Link newly selected properties
      for (const propId of propertyIds) {
        await this.inmuebleRepo.update(propId, {
          tenantId: id,
          status: 'ALQUILADO',
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);

    // Unlink all properties and reset status
    const linkedProperties = await this.inmuebleRepo.find({ where: { tenantId: id } });
    for (const prop of linkedProperties) {
      await this.inmuebleRepo.update(prop.id, {
        tenantId: null,
        status: 'DISPONIBLE',
      });
    }

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
