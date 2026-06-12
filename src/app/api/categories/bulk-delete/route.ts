import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return apiError('Non autorisé', 401);

  await connectDB();

  const { ids } = await req.json() as { ids: string[] };
  if (!ids?.length) return apiError('Aucun identifiant fourni', 400);

  for (const id of ids) {
    const usedByProduct  = await Product.findOne({ category: id, isActive: true }).lean();
    const hasChildren    = await Category.findOne({ parent: id }).lean();
    if (usedByProduct || hasChildren) {
      return apiError('Une ou plusieurs catégories sélectionnées sont utilisées ou ont des sous-catégories', 400);
    }
  }

  await Category.deleteMany({ _id: { $in: ids } });

  return apiSuccess({ message: `${ids.length} catégorie(s) supprimée(s)` });
}