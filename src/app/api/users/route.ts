import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';

const createUserSchema = z.object({
  name:     z.string().min(1, 'Nom requis'),
  email:    z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  role:     z.string().min(1, 'Rôle requis'),
});

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return apiError('Non autorisé', 401);

  await connectDB();

  const users = await User.find()
    .populate('role', 'name')
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  return apiSuccess(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const body   = await req.json();
    const data   = createUserSchema.parse(body);
    const hashed = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      name:     data.name,
      email:    data.email,
      password: hashed,
      role:     data.role,
    });

    const result = user.toObject();
    delete (result as any).password;

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}