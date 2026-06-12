import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import PurchaseOrder from '@/models/PurchaseOrder';
import PurchaseOrderItem from '@/models/PurchaseOrderItem';
import { purchaseOrderSchema } from '@/schemas/order';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';
import Supplier from '@/models/Supplier';
import Warehouse from '@/models/Warehouse';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { searchParams } = new URL(req.url);
  const page   = parseInt(searchParams.get('page')   ?? '1');
  const limit  = parseInt(searchParams.get('limit')  ?? '20');
  const status = searchParams.get('status') ?? '';

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .populate('supplier',  'name')
      .populate('warehouse', 'name code')
      .populate('createdBy', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    PurchaseOrder.countDocuments(filter),
  ]);

  return apiSuccess({ orders, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const body = await req.json();
    const data = purchaseOrderSchema.parse(body);
    const { items, ...orderData } = data;

    const order = await PurchaseOrder.create({
      ...orderData,
      createdBy: session.user.id,
    });

    await PurchaseOrderItem.insertMany(
      items.map((item) => ({ ...item, order: order._id }))
    );

    return apiSuccess(order, 201);
  } catch (error) {
    return handleApiError(error);
  }
}