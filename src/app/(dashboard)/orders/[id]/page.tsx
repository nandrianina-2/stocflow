import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import PurchaseOrder from '@/models/PurchaseOrder';
import PurchaseOrderItem from '@/models/PurchaseOrderItem';
import Supplier from '@/models/Supplier';
import Warehouse from '@/models/Warehouse';
import User from '@/models/User';
import ProductVariant from '@/models/ProductVariant';
import Product from '@/models/Product';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { OrderActionsClient } from './OrderActionsClient';

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  draft:     { label: 'Brouillon',   variant: 'default' },
  sent:      { label: 'Envoyé',      variant: 'info'    },
  partial:   { label: 'Partiel',     variant: 'warning' },
  received:  { label: 'Réceptionné', variant: 'success' },
  cancelled: { label: 'Annulé',      variant: 'danger'  },
};

async function getOrder(id: string) {
  const session = await auth();
  if (!session) return null;

  await connectDB();

  const [order, items] = await Promise.all([
    PurchaseOrder.findById(id)
      .populate('supplier',  'name email phone')
      .populate('warehouse', 'name code')
      .populate('createdBy', 'name')
      .lean(),
    PurchaseOrderItem.find({ order: id })
      .populate({ path: 'variant', populate: { path: 'product', select: 'name sku' } })
      .lean(),
  ]);

  if (!order) return null;

  return { ...order, items };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = await params;
  const order   = await getOrder(id) as any;

  if (!order) notFound();

  const statusInfo = statusConfig[order.status];
  const total      = order.items.reduce((sum: number, i: any) => sum + i.quantityOrdered * i.unitPrice, 0);
  const canReceive = order.status === 'draft' || order.status === 'sent' || order.status === 'partial';

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={`Bon de commande — ${order.reference ?? order._id.toString().slice(-8).toUpperCase()}`}
        description={`Créé le ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`}
        action={
          <Badge
            label={statusInfo?.label ?? order.status}
            variant={statusInfo?.variant ?? 'default'}
          />
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</h2>
          <div className="text-sm space-y-1">
            <p className="text-white font-medium">{order.supplier?.name ?? '—'}</p>
            {order.supplier?.email && <p className="text-gray-400">{order.supplier.email}</p>}
            {order.supplier?.phone && <p className="text-gray-400">{order.supplier.phone}</p>}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Livraison</h2>
          <div className="text-sm space-y-1">
            <p className="text-white">{order.warehouse?.name ?? '—'}</p>
            {order.expectedAt && (
              <p className="text-gray-400">
                Prévue le {new Date(order.expectedAt).toLocaleDateString('fr-FR')}
              </p>
            )}
            {order.receivedAt && (
              <p className="text-green-400">
                Reçue le {new Date(order.receivedAt).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Montant total</h2>
          <p className="text-2xl font-bold text-white">
            {total.toLocaleString('fr-FR')} Ar
          </p>
          {order.notes && (
            <p className="text-xs text-gray-400 mt-2">{order.notes}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-medium text-white">Articles commandés</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Commandé</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reçu</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sous-total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {order.items.map((item: any) => (
              <tr key={item._id.toString()} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 text-white">{item.variant?.product?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{item.variant?.sku ?? '—'}</td>
                <td className="px-4 py-3 text-white">{item.quantityOrdered}</td>
                <td className="px-4 py-3">
                  <span className={item.quantityReceived >= item.quantityOrdered ? 'text-green-400' : 'text-gray-400'}>
                    {item.quantityReceived}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{item.unitPrice.toLocaleString('fr-FR')} Ar</td>
                <td className="px-4 py-3 text-white">
                  {(item.quantityOrdered * item.unitPrice).toLocaleString('fr-FR')} Ar
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canReceive && (
        <OrderActionsClient
          orderId={order._id.toString()}
          warehouseId={order.warehouse?._id?.toString() ?? ''}
          items={order.items.map((i: any) => ({
            _id:              i._id.toString(),
            quantityOrdered:  i.quantityOrdered,
            quantityReceived: i.quantityReceived,
            variant:          i.variant ? {
              sku:     i.variant.sku,
              product: i.variant.product ? { name: i.variant.product.name } : null,
            } : null,
          }))}
        />
      )}
    </div>
  );
}