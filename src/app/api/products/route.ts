import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { productSchema } from '@/schemas/product';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { searchParams } = new URL(req.url);
  const page     = parseInt(searchParams.get('page')     ?? '1');
  const limit    = parseInt(searchParams.get('limit')    ?? '20');
  const search   = searchParams.get('search')   ?? '';
  const category = searchParams.get('category') ?? '';
  const type     = searchParams.get('type')     ?? '';

  const filter: Record<string, unknown> = { isActive: true };

  if (search)   filter.$text     = { $search: search };
  if (category) filter.category  = category;
  if (type)     filter.type      = type;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('supplier', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    Product.countDocuments(filter),
  ]);

  return apiSuccess({ products, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const body = await req.json();
    const data = productSchema.parse(body);
    const product = await Product.create(data);
    return apiSuccess(product, 201);
  } catch (error) {
    return handleApiError(error);
  }
}