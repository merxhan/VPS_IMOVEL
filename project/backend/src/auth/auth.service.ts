import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(phone: string, pass: string) {
    const user = await this.usuarioRepo.findOne({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return {
      token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
    };
  }

  async findAll() {
    return this.usuarioRepo.find({
      select: ['id', 'name', 'phone', 'role', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
  }

  async register(data: any) {
    const existing = await this.usuarioRepo.findOne({ where: { phone: data.phone } });
    if (existing) throw new UnauthorizedException('El teléfono ya está registrado');
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.usuarioRepo.create({
      ...data,
      password: hashedPassword,
    });
    return this.usuarioRepo.save(user);
  }

  async update(id: string, data: any) {
    const user = await this.usuarioRepo.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    await this.usuarioRepo.update(id, data);
    return this.usuarioRepo.findOne({ where: { id } });
  }

  async delete(id: string) {
    return this.usuarioRepo.delete(id);
  }
}
