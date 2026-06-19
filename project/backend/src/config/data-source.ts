import { DataSource } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Inmueble } from '../entities/inmueble.entity';
import { Inquilino } from '../entities/inquilino.entity';
import { Documento } from '../entities/documento.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sici?schema=public',
  synchronize: false, // In production, use migrations
  logging: process.env.NODE_ENV !== 'production',
  entities: [Usuario, Inmueble, Inquilino, Documento],
  migrations: [__dirname + '/../migrations/*.ts'],
  subscribers: [],
});
