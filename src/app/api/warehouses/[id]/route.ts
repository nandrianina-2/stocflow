import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Warehouse from '@/models/Warehouse';
import WarehouseLocation from '@/models/WarehouseLocation';
import StockLevel from '@/models/StockLevel';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return apiError('Non autorisé', 401);

  await connectDB();

  const { id } = await params;

  const locations  = await WarehouseLocation.find({ warehouse: id }).lean();
  const locationIds = locations.map((l) => l._id);

  if (locationIds.length) {
    const hasStock = await StockLevel.findOne({
      location: { $in: locationIds },
      quantity: { $gt: 0 },
    }).lean();

    if (hasStock) {
      return apiError('Cet entrepôt contient du stock — videz-le avant de le supprimer', 400);
    }

    await WarehouseLocation.deleteMany({ warehouse: id });
  }

  const warehouse = await Warehouse.findByIdAndDelete(id);
  if (!warehouse) return apiError('Entrepôt introuvable', 404);

  return apiSuccess({ message: 'Entrepôt supprimé' });
}