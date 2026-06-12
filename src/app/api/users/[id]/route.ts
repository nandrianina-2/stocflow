import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await params;

  if (id === session.user.id) {
    return apiError('Vous ne pouvez pas supprimer votre propre compte', 400);
  }

  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!user) return apiError('Utilisateur introuvable', 404);

  return apiSuccess({ message: 'Utilisateur désactivé' });
}