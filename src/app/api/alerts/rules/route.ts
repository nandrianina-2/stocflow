import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import AlertRule from '@/models/AlertRule';
import { z } from 'zod';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';
import Product from '@/models/Product';
import Warehouse from '@/models/Warehouse';

const alertRuleSchema = z.object({
  product:      z.string().min(1),
  warehouse:    z.string().optional().nullable(),
  metric:       z.enum(['low_stock', 'overstock', 'expiry']),
  threshold:    z.number().min(0),
  notifyEmails: z.array(z.string().email()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const rules = await AlertRule.find()
    .populate('product',   'name sku')
    .populate('warehouse', 'name code')
    .sort({ createdAt: -1 })
    .lean();

  return apiSuccess(rules);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const body = await req.json();
    const data = alertRuleSchema.parse(body);
    const rule = await AlertRule.create(data);
    return apiSuccess(rule, 201);
  } catch (error) {
    return handleApiError(error);
  }
}