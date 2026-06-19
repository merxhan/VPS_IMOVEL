import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Inmueble } from './inmueble.entity';
import { Inquilino } from './inquilino.entity';

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column('int')
  fileSize: number;

  @Column({ nullable: true })
  propertyId: string;

  @ManyToOne(() => Inmueble, (inmueble) => inmueble.documents, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Inmueble;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Inquilino, (inquilino) => inquilino.documents, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Inquilino;

  @CreateDateColumn()
  createdAt: Date;
}
