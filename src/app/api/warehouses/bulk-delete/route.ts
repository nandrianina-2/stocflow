import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Warehouse from '@/models/Warehouse';
import WarehouseLocation from '@/models/WarehouseLocation';
import StockLevel from '@/models/StockLevel';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') return apiError('Non autorisé', 401);

  await connectDB();

  const { ids } = await req.json() as { ids: string[] };
  if (!ids?.length) return apiError('Aucun identifiant fourni', 400);

  for (const id of ids) {
    const locations   = await WarehouseLocation.find({ warehouse: id }).lean();
    const locationIds = locations.map((l) => l._id);

    if (locationIds.length) {
      const hasStock = await StockLevel.findOne({
        location: { $in: locationIds },
        quantity: { $gt: 0 },
      }).lean();

      if (hasStock) {
        return apiError('Un ou plusieurs entrepôts sélectionnés contiennent du stock', 400);
      }
    }
  }

  for (const id of ids) {
    await WarehouseLocation.deleteMany({ warehouse: id });
  }

  await Warehouse.deleteMany({ _id: { $in: ids } });

  return apiSuccess({ message: `${ids.length} entrepôt(s) supprimé(s)` });
}