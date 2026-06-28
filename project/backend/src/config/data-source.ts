import { DataSource } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Inmueble } from '../entities/inmueble.entity';
import { Inquilino } from '../entities/inquilino.entity';
import { Documento } from '../entities/documento.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'sici'}?schema=public`,
  synchronize: false, 
  logging: process.env.NODE_ENV !== 'production',
  entities: [Usuario, Inmueble, Inquilino, Documento],
  migrations: [__dirname + '/../migrations/*.ts'],
  subscribers: [],
});
