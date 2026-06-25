import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppDataSource } from './config/data-source';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { TenantsModule } from './tenants/tenants.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    PropertiesModule,
    TenantsModule,
    DashboardModule,
    DocumentsModule,
  ],
})
export class AppModule {}
