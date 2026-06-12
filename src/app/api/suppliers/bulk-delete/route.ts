import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Supplier from '@/models/Supplier';
import Product from '@/models/Product';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return apiError('Non autorisé', 401);

  await connectDB();

  const { ids } = await req.json() as { ids: string[] };
  if (!ids?.length) return apiError('Aucun identifiant fourni', 400);

  const usedIds: string[] = [];

  for (const id of ids) {
    const used = await Product.findOne({ supplier: id, isActive: true }).lean();
    if (used) usedIds.push(id);
  }

  if (usedIds.length) {
    return apiError(`${usedIds.length} fournisseur(s) utilisé(s) par des produits actifs — suppression annulée`, 400);
  }

  await Supplier.deleteMany({ _id: { $in: ids } });

  return apiSuccess({ message: `${ids.length} fournisseur(s) supprimé(s)` });
}