import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import StockMovement from '@/models/StockMovement';
import MovementItem from '@/models/MovementItem';
import { movementSchema } from '@/schemas/movement';
import User from '@/models/User';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { searchParams } = new URL(req.url);
  const page   = parseInt(searchParams.get('page')   ?? '1');
  const limit  = parseInt(searchParams.get('limit')  ?? '20');
  const type   = searchParams.get('type')   ?? '';
  const status = searchParams.get('status') ?? '';

  const filter: Record<string, unknown> = {};
  if (type)   filter.type   = type;
  if (status) filter.status = status;

  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .populate('createdBy',   'name email')
      .populate('confirmedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    StockMovement.countDocuments(filter),
  ]);

  return apiSuccess({ movements, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  try {
    await connectDB();
    const body = await req.json();
    const data = movementSchema.parse(body);
    const { items, ...movementData } = data;

    const movement = await StockMovement.create({
      ...movementData,
      createdBy: session.user.id,
      status:    'draft',
    });

    const cleanedItems = items.map((item) => ({
      ...item,
      movement:     movement._id,
      fromLocation: item.fromLocation || undefined,
      toLocation:   item.toLocation   || undefined,
    }));

    await MovementItem.insertMany(cleanedItems);

    return apiSuccess(movement, 201);
  } catch (error) {
    return handleApiError(error);
  }
}