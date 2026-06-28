import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inmueble } from '../entities/inmueble.entity';
import { Documento } from '../entities/documento.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Inmueble)
    private inmuebleRepo: Repository<Inmueble>,
    @InjectRepository(Documento)
    private docRepo: Repository<Documento>,
  ) {}

  async findAll(search?: string, status?: string) {
    const queryBuilder = this.inmuebleRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.tenant', 'tenant')
      .leftJoinAndSelect('property.documents', 'documents');

    if (search) {
      queryBuilder.andWhere(
        '(property.name ILIKE :search OR property.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('property.status = :status', { status });
    }

    const properties = await queryBuilder.getMany();
    return properties.map((prop) => ({
      ...prop,
      tenants: prop.tenant ? [prop.tenant] : [],
    }));
  }

  async findOne(id: string) {
    const property = await this.inmuebleRepo.findOne({
      where: { id },
      relations: ['tenant', 'documents'],
    });
    if (!property) throw new NotFoundException('Inmueble no encontrado');
    return {
      ...property,
      tenants: property.tenant ? [property.tenant] : [],
    };
  }

  async create(data: any) {
    const newProperty = this.inmuebleRepo.create(data);
    return this.inmuebleRepo.save(newProperty);
  }

  async update(id: string, data: any) {
    await this.findOne(id); 
    await this.inmuebleRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const prop = await this.findOne(id);
    return this.inmuebleRepo.remove(prop);
  }

  async addDocument(propertyId: string, file: Express.Multer.File) {
    await this.findOne(propertyId); 
    const doc = this.docRepo.create({
      name: file.originalname,
      filePath: file.filename,
      mimeType: file.mimetype,
      fileSize: file.size,
      propertyId,
    });
    return this.docRepo.save(doc);
  }
}
