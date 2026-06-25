import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inmueble } from '../entities/inmueble.entity';
import { Inquilino } from '../entities/inquilino.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Inmueble)
    private readonly inmuebleRepo: Repository<Inmueble>,
    @InjectRepository(Inquilino)
    private readonly inquilinoRepo: Repository<Inquilino>,
  ) {}

  async getDashboardData() {
    const properties = await this.inmuebleRepo.find();
    const tenants = await this.inquilinoRepo.find({
      relations: ['properties'],
    });

    const totalProperties = properties.length;
    const occupiedProperties = properties.filter(
      (p) => p.status === 'ALQUILADO',
    ).length;

    const occupancyRate =
      totalProperties > 0
        ? Math.round((occupiedProperties / totalProperties) * 100 * 10) / 10
        : 0;

    const cashFlow = properties
      .filter((p) => p.status === 'ALQUILADO')
      .reduce((sum, p) => sum + Number(p.rentValue || 0), 0);

    const projectedIncome = properties.reduce(
      (sum, p) => sum + Number(p.rentValue || 0),
      0,
    );

    // Get today's date in America/Sao_Paulo (UTC-3)
    const now = new Date();
    const utc3String = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const today = new Date(utc3String);
    today.setHours(0, 0, 0, 0);

    const alertsList: any[] = [];
    for (const t of tenants) {
      if (!t.contractEnd || !t.properties || t.properties.length === 0) continue;

      let contractEndDay: Date;
      const dateVal = t.contractEnd;
      if (dateVal instanceof Date) {
        contractEndDay = new Date(
          dateVal.getFullYear(),
          dateVal.getMonth(),
          dateVal.getDate(),
        );
      } else {
        const parts = String(dateVal).split('T')[0].split('-');
        if (parts.length === 3) {
          contractEndDay = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2]),
          );
        } else {
          contractEndDay = new Date(dateVal);
        }
      }
      contractEndDay.setHours(0, 0, 0, 0);

      const diffTime = contractEndDay.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 60) {
        for (const prop of t.properties) {
          alertsList.push({
            id: `${t.id}-${prop.id}`,
            tenantName: t.name,
            propertyName: prop.name,
            propertyAddress: prop.address,
            contractEnd: t.contractEnd,
            daysRemaining: daysRemaining,
          });
        }
      }
    }

    const alerts = alertsList.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return {
      kpis: {
        totalProperties,
        occupiedProperties,
        occupancyRate,
        projectedIncome,
        cashFlow,
      },
      alerts,
    };
  }
}
