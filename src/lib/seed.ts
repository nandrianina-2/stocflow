import { connectDB } from './db';
import Role from '@/models/Role';
import User from '@/models/User';
import Warehouse from '@/models/Warehouse';
import bcrypt from 'bcryptjs';

export async function seed() {
  await connectDB();

  // Rôles
  const adminRole = await Role.findOneAndUpdate(
    { name: 'admin' },
    { name: 'admin', permissions: ['admin'] },
    { upsert: true, new: true }
  );

  await Role.findOneAndUpdate(
    { name: 'manager' },
    { name: 'manager', permissions: ['stock:read', 'stock:write', 'movements:manage', 'orders:manage', 'reports:read'] },
    { upsert: true, new: true }
  );

  await Role.findOneAndUpdate(
    { name: 'viewer' },
    { name: 'viewer', permissions: ['stock:read', 'reports:read'] },
    { upsert: true, new: true }
  );

  // User admin par défaut
  const existing = await User.findOne({ email: 'admin@stockflow.com' });
  if (!existing) {
    const hashed = await bcrypt.hash('Admin1234!', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@stockflow.com',
      password: hashed,
      role: adminRole._id,
    });
  }

  // Entrepôt de test
  await Warehouse.findOneAndUpdate(
    { code: 'WH-MAIN' },
    { name: 'Entrepôt Principal', code: 'WH-MAIN', address: 'Antananarivo' },
    { upsert: true, new: true }
  );

  console.log('✅ Seed terminé');
}