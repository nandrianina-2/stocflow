import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import PurchaseOrder from '@/models/PurchaseOrder';
import PurchaseOrderItem from '@/models/PurchaseOrderItem';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await params;

  const [order, items] = await Promise.all([
    PurchaseOrder.findById(id)
      .populate('supplier',  'name email phone')
      .populate('warehouse', 'name code')
      .populate('createdBy', 'name')
      .lean(),
    PurchaseOrderItem.find({ order: id })
      .populate({ path: 'variant', populate: { path: 'product', select: 'name sku' } })
      .lean(),
  ]);

  if (!order) return apiError('Bon de commande introuvable', 404);

  return apiSuccess({ ...order, items });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { id }   = await params;
  const body     = await req.json();
  const { status, notes, supplierRef, expectedAt } = body;

  const order = await PurchaseOrder.findByIdAndUpdate(
    id,
    { ...(status && { status }), ...(notes && { notes }), ...(supplierRef && { supplierRef }), ...(expectedAt && { expectedAt }) },
    { new: true }
  );

  if (!order) return apiError('Bon de commande introuvable', 404);

  return apiSuccess(order);
}