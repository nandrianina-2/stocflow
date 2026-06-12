import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import ProductVariant from '@/models/ProductVariant';
import Supplier from '@/models/Supplier';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) return apiSuccess({ products: [], variants: [], suppliers: [] });

  await connectDB();

  const regex = new RegExp(q, 'i');

  const [products, variants, suppliers] = await Promise.all([
    Product.find({
      isActive: true,
      $or: [{ name: regex }, { sku: regex }],
    })
      .select('name sku type')
      .limit(5)
      .lean(),

    ProductVariant.find({
      isActive: true,
      $or: [{ sku: regex }, { barcode: regex }],
    })
      .populate('product', 'name')
      .select('sku barcode unit')
      .limit(5)
      .lean(),

    Supplier.find({ name: regex })
      .select('name email')
      .limit(3)
      .lean(),
  ]);

  return apiSuccess({ products, variants, suppliers });
}