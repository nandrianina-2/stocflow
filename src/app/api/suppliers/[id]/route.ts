import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Supplier from '@/models/Supplier';
import Product from '@/models/Product';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await params;

  const usedByProduct = await Product.findOne({ supplier: id, isActive: true }).lean();
  if (usedByProduct) {
    return apiError('Ce fournisseur est utilisé par un ou plusieurs produits actifs', 400);
  }

  const supplier = await Supplier.findByIdAndDelete(id);
  if (!supplier) return apiError('Fournisseur introuvable', 404);

  return apiSuccess({ message: 'Fournisseur supprimé' });
}