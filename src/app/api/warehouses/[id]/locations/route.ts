import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import WarehouseLocation from '@/models/WarehouseLocation';
import { warehouseLocationSchema } from '@/schemas/warehouse';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await params;
  const locations = await WarehouseLocation.find({ warehouse: id, isActive: true })
    .sort({ code: 1 })
    .lean();

  return apiSuccess(locations);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const data = warehouseLocationSchema.parse(body);
    const location = await WarehouseLocation.create({ ...data, warehouse: id });
    return apiSuccess(location, 201);
  } catch (error) {
    return handleApiError(error);
  }
}