import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import { categorySchema } from '@/schemas/category';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';

export async function GET() {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const categories = await Category.find()
    .populate('parent', 'name slug')
    .sort({ name: 1 })
    .lean();

  return apiSuccess(categories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const body = await req.json();
    const data = categorySchema.parse(body);
    const category = await Category.create(data);
    return apiSuccess(category, 201);
  } catch (error) {
    return handleApiError(error);
  }
}