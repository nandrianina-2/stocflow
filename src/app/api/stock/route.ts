import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import StockLevel from '@/models/StockLevel';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { searchParams } = new URL(req.url);
  const warehouse = searchParams.get('warehouse');
  const variant   = searchParams.get('variant');

  const filter: Record<string, unknown> = {};

  if (variant) {
    filter.variant = variant;
  }

  let query = StockLevel.find(filter)
    .populate({ path: 'variant', populate: { path: 'product', select: 'name sku' } })
    .populate({ path: 'location', populate: { path: 'warehouse', select: 'name code' } });

  if (warehouse) {
    const levels = await StockLevel.find(filter)
      .populate({ path: 'location', match: { warehouse }, populate: { path: 'warehouse', select: 'name code' } })
      .populate({ path: 'variant', populate: { path: 'product', select: 'name sku' } })
      .lean();

    const filtered = levels.filter((l) => l.location !== null);
    return apiSuccess(filtered);
  }

  const levels = await query.lean();
  return apiSuccess(levels);
}