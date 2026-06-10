import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import StockLevel from '@/models/StockLevel';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET(_: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { variantId } = await params;

  const levels = await StockLevel.find({ variant: variantId })
    .populate({ path: 'location', populate: { path: 'warehouse', select: 'name code' } })
    .lean();

  return apiSuccess(levels);
}