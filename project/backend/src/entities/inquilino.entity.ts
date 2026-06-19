import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Inmueble } from './inmueble.entity';
import { Documento } from './documento.entity';

@Entity('inquilinos')
export class Inquilino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  documentType: string;

  @Column({ unique: true })
  documentValue: string;

  @Column({ type: 'date', nullable: true })
  contractStart: Date;

  @Column({ type: 'date', nullable: true })
  contractEnd: Date;

  @Column({ nullable: true })
  propertyId: string;

  @ManyToOne(() => Inmueble, (inmueble) => inmueble.tenants, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'propertyId' })
  property: Inmueble;

  @OneToMany(() => Documento, (documento) => documento.tenant)
  documents: Documento[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
