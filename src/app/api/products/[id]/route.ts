import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { productSchema } from '@/schemas/product';
import Category from '@/models/Category';
import Supplier from '@/models/Supplier';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await params;
  const product = await Product.findById(id)
    .populate('category', 'name slug')
    .populate('supplier', 'name email phone')
    .lean();

  if (!product) return apiError('Produit introuvable', 404);

  return apiSuccess(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const data = productSchema.partial().parse(body);
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) return apiError('Produit introuvable', 404);
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await params;
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) return apiError('Produit introuvable', 404);

  return apiSuccess({ message: 'Produit désactivé' });
}