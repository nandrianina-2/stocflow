import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import ProductVariant from '@/models/ProductVariant';
import { productVariantSchema } from '@/schemas/product';
import Product from '@/models/Product';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await params;
  const variants = await ProductVariant.find({ product: id, isActive: true }).lean();

  return apiSuccess(variants);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const data = productVariantSchema.parse(body);
    const variant = await ProductVariant.create({ ...data, product: id });
    return apiSuccess(variant, 201);
  } catch (error) {
    return handleApiError(error);
  }
}