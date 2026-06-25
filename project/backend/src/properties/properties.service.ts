import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inmueble } from '../entities/inmueble.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Inmueble)
    private inmuebleRepo: Repository<Inmueble>,
  ) {}

  async findAll(search?: string, status?: string) {
    const queryBuilder = this.inmuebleRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.tenants', 'tenants')
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

    return queryBuilder.getMany();
  }

  async findOne(id: string) {
    const property = await this.inmuebleRepo.findOne({
      where: { id },
      relations: ['tenants', 'documents'],
    });
    if (!property) throw new NotFoundException('Inmueble no encontrado');
    return property;
  }

  async create(data: any) {
    const newProperty = this.inmuebleRepo.create(data);
    return this.inmuebleRepo.save(newProperty);
  }

  async update(id: string, data: any) {
    await this.findOne(id); // verifica existencia
    await this.inmuebleRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const prop = await this.findOne(id);
    return this.inmuebleRepo.remove(prop);
  }
}
