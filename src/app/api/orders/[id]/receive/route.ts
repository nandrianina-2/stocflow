import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import PurchaseOrder from '@/models/PurchaseOrder';
import PurchaseOrderItem from '@/models/PurchaseOrderItem';
import StockMovement from '@/models/StockMovement';
import MovementItem from '@/models/MovementItem';
import StockLevel from '@/models/StockLevel';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const { id }     = await params;
  const body       = await req.json();
  const { items, locationId } = body as { items: { itemId: string; quantityReceived: number }[]; locationId: string };

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const order = await PurchaseOrder.findById(id).session(dbSession);
    if (!order)                         return apiError('Bon de commande introuvable', 404);
    if (order.status === 'cancelled')   return apiError('Ce bon de commande est annulé', 400);
    if (order.status === 'received')    return apiError('Ce bon de commande est déjà réceptionné', 400);

    const movement = await StockMovement.create([{
      type:      'entry',
      reference: `REC-${order.reference ?? id}`,
      notes:     `Réception BC ${order.reference ?? id}`,
      status:    'confirmed',
      createdBy: session.user.id,
      confirmedBy: session.user.id,
      confirmedAt: new Date(),
    }], { session: dbSession });

    let allReceived = true;

    for (const { itemId, quantityReceived } of items) {
      const orderItem = await PurchaseOrderItem.findById(itemId).session(dbSession);
      if (!orderItem) continue;

      const newQty = orderItem.quantityReceived + quantityReceived;
      if (newQty < orderItem.quantityOrdered) allReceived = false;

      await PurchaseOrderItem.findByIdAndUpdate(
        itemId,
        { quantityReceived: newQty },
        { session: dbSession }
      );

      await MovementItem.create([{
        movement:   movement[0]._id,
        variant:    orderItem.variant,
        quantity:   quantityReceived,
        toLocation: locationId,
        unitCost:   orderItem.unitPrice,
      }], { session: dbSession });

      await StockLevel.findOneAndUpdate(
        { variant: orderItem.variant, location: locationId },
        { $inc: { quantity: quantityReceived } },
        { session: dbSession, upsert: true, setDefaultsOnInsert: true }
      );
    }

    order.status     = allReceived ? 'received' : 'partial';
    order.receivedAt = allReceived ? new Date() : undefined;
    await order.save({ session: dbSession });

    await dbSession.commitTransaction();
    return apiSuccess({ order, movement: movement[0] });
  } catch (error) {
    await dbSession.abortTransaction();
    return apiError('Erreur lors de la réception', 500);
  } finally {
    dbSession.endSession();
  }
}