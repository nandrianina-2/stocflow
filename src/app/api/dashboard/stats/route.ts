import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import StockLevel from '@/models/StockLevel';
import StockMovement from '@/models/StockMovement';
import AlertLog from '@/models/AlertLog';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET() {
  const session = await auth();
  if (!session) return apiError('Non autorisé', 401);

  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalStockValue,
    movementsToday,
    unresolvedAlerts,
    lowStockCount,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    StockLevel.aggregate([
      {
        $lookup: {
          from:         'productvariants',
          localField:   'variant',
          foreignField: '_id',
          as:           'variantData',
        },
      },
      { $unwind: '$variantData' },
      {
        $group: {
          _id:   null,
          total: { $sum: { $multiply: ['$quantity', '$variantData.costPrice'] } },
        },
      },
    ]),
    StockMovement.countDocuments({ createdAt: { $gte: today }, status: 'confirmed' }),
    AlertLog.countDocuments({ resolved: false }),
    StockLevel.countDocuments({
      $expr: { $lte: ['$quantity', '$minThreshold'] },
    }),
  ]);

  return apiSuccess({
    totalProducts,
    totalStockValue: totalStockValue[0]?.total ?? 0,
    movementsToday,
    unresolvedAlerts,
    lowStockCount,
  });
}