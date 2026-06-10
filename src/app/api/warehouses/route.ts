import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Warehouse from '@/models/Warehouse';
import { warehouseSchema } from '@/schemas/warehouse';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';

export async function GET() {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const warehouses = await Warehouse.find({ isActive: true }).sort({ name: 1 }).lean();
  return apiSuccess(warehouses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const body = await req.json();
    const data = warehouseSchema.parse(body);
    const warehouse = await Warehouse.create(data);
    return apiSuccess(warehouse, 201);
  } catch (error) {
    return handleApiError(error);
  }
}