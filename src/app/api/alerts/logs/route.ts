import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import AlertLog from '@/models/AlertLog';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET() {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const logs = await AlertLog.find({ resolved: false })
    .populate({ path: 'rule', populate: [{ path: 'product', select: 'name sku' }, { path: 'warehouse', select: 'name' }] })
    .sort({ triggeredAt: -1 })
    .lean();

  return apiSuccess(logs);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await req.json();
  const log = await AlertLog.findByIdAndUpdate(
    id,
    { resolved: true, resolvedAt: new Date() },
    { new: true }
  );

  if (!log) return apiError('Log introuvable', 404);
  return apiSuccess(log);
}