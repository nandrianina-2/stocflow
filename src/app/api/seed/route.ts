import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';
import bcrypt from 'bcryptjs';

export async function GET() {
  await connectDB();

  // Nettoyage complet
  await User.deleteMany({});
  await Role.deleteMany({});

  // Recréation des rôles
  const adminRole = await Role.create({
    name: 'admin',
    permissions: ['admin'],
  });

  await Role.create({
    name: 'manager',
    permissions: ['stock:read', 'stock:write', 'movements:manage', 'orders:manage', 'reports:read'],
  });

  await Role.create({
    name: 'viewer',
    permissions: ['stock:read', 'reports:read'],
  });

  // Recréation du user admin avec hash explicite
  const hashed = await bcrypt.hash('Admin1234!', 10);

  await User.create({
    name:     'Admin',
    email:    'admin@stockflow.com',
    password: hashed,
    role:     adminRole._id,
    isActive: true,
  });

  return NextResponse.json({ ok: true, message: 'Seed terminé' });
}