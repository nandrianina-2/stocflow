import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Supplier from '@/models/Supplier';
import { supplierSchema } from '@/schemas/supplier';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';

export async function GET() {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const suppliers = await Supplier.find().sort({ name: 1 }).lean();
  return apiSuccess(suppliers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const body = await req.json();
    const data = supplierSchema.parse(body);
    const supplier = await Supplier.create(data);
    return apiSuccess(supplier, 201);
  } catch (error) {
    return handleApiError(error);
  }
}