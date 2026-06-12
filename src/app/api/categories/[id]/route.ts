import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
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

  const usedByProduct = await Product.findOne({ category: id, isActive: true }).lean();
  if (usedByProduct) {
    return apiError('Cette catégorie est utilisée par un ou plusieurs produits actifs', 400);
  }

  const hasChildren = await Category.findOne({ parent: id }).lean();
  if (hasChildren) {
    return apiError('Cette catégorie contient des sous-catégories', 400);
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) return apiError('Catégorie introuvable', 404);

  return apiSuccess({ message: 'Catégorie supprimée' });
}