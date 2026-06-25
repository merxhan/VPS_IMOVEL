import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Inquilino } from './inquilino.entity';
import { Documento } from './documento.entity';

@Entity('inmuebles')
export class Inmueble {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  cep: string;

  @Column('decimal', { precision: 10, scale: 2 })
  rentValue: number;

  @Column()
  status: string;

  @Column({ nullable: true })
  tenantId: string | null;

  @ManyToOne(() => Inquilino, (inquilino) => inquilino.properties, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Inquilino;

  @OneToMany(() => Documento, (documento) => documento.property)
  documents: Documento[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
