import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquilino } from '../entities/inquilino.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Inquilino)
    private inquilinoRepo: Repository<Inquilino>,
  ) {}

  async findAll() {
    return this.inquilinoRepo.find({ relations: ['property', 'documents'] });
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
}
