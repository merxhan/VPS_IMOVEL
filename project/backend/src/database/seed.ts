import { DataSource } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { AppDataSource } from '../config/data-source';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Usuario);

  const phone = '62999999999';
  const existingUser = await repo.findOne({ where: { phone } });
  
  if (!existingUser) {
    const password = await bcrypt.hash('12345678', 10);
    const user = repo.create({
      phone,
      password,
      name: 'Admin Test',
      role: 'ADMIN',
    });
    await repo.save(user);
    console.log('User created:', user.phone);
  } else {
    console.log('User already exists:', existingUser.phone);
  }

  await AppDataSource.destroy();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
