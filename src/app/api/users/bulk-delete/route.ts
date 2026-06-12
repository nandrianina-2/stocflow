import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return apiError('Non autorisé', 401);

  await connectDB();

  const { ids } = await req.json() as { ids: string[] };
  if (!ids?.length) return apiError('Aucun identifiant fourni', 400);

  if (ids.includes(session.user.id)) {
    return apiError('Vous ne pouvez pas désactiver votre propre compte', 400);
  }

  await User.updateMany({ _id: { $in: ids } }, { isActive: false });

  return apiSuccess({ message: `${ids.length} utilisateur(s) désactivé(s)` });
}