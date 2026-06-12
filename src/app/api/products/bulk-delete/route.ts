import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { ids } = await req.json() as { ids: string[] };
  if (!ids?.length) return apiError('Aucun identifiant fourni', 400);

  await Product.updateMany(
    { _id: { $in: ids } },
    { isActive: false }
  );

  return apiSuccess({ message: `${ids.length} produit(s) désactivé(s)` });
}