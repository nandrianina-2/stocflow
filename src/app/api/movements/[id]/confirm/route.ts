import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import StockMovement from '@/models/StockMovement';
import MovementItem from '@/models/MovementItem';
import StockLevel from '@/models/StockLevel';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await params;
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const movement = await StockMovement.findById(id).session(dbSession);

    if (!movement)                    return apiError('Mouvement introuvable', 404);
    if (movement.status !== 'draft')  return apiError('Ce mouvement ne peut plus être confirmé', 400);

    const items = await MovementItem.find({ movement: id }).session(dbSession);

    for (const item of items) {
      if (item.fromLocation) {
        await StockLevel.findOneAndUpdate(
          { variant: item.variant, location: item.fromLocation },
          { $inc: { quantity: -item.quantity } },
          { session: dbSession }
        );
      }

      if (item.toLocation) {
        await StockLevel.findOneAndUpdate(
          { variant: item.variant, location: item.toLocation },
          { $inc: { quantity: item.quantity } },
          { session: dbSession, upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    movement.status      = 'confirmed';
    movement.confirmedBy = new mongoose.Types.ObjectId(session.user.id);
    movement.confirmedAt = new Date();
    await movement.save({ session: dbSession });

    await dbSession.commitTransaction();
    return apiSuccess(movement);
  } catch (error) {
    await dbSession.abortTransaction();
    return apiError('Erreur lors de la confirmation', 500);
  } finally {
    dbSession.endSession();
  }
}