import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { OrderActionsClient } from './OrderActionsClient';

interface OrderItem {
  _id:              string;
  quantityOrdered:  number;
  quantityReceived: number;
  unitPrice:        number;
  variant: {
    sku:     string;
    product: { name: string } | null;
  } | null;
}

interface PurchaseOrder {
  _id:         string;
  reference:   string;
  supplierRef: string;
  status:      string;
  expectedAt:  string;
  receivedAt:  string;
  notes:       string;
  createdAt:   string;
  supplier:    { name: string; email: string; phone: string } | null;
  warehouse:   { _id: string; name: string; code: string } | null;
  createdBy:   { name: string } | null;
  items:       OrderItem[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  draft:     { label: 'Brouillon',   variant: 'default' },
  sent:      { label: 'Envoyé',      variant: 'info'    },
  partial:   { label: 'Partiel',     variant: 'warning' },
  received:  { label: 'Réceptionné', variant: 'success' },
  cancelled: { label: 'Annulé',      variant: 'danger'  },
};

async function getOrder(id: string): Promise<PurchaseOrder | null> {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/orders/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = await params;
  const order   = await getOrder(id);

  if (!order) notFound();

  const statusInfo = statusConfig[order.status];
  const total      = order.items.reduce((sum, i) => sum + i.quantityOrdered * i.unitPrice, 0);
  const canReceive = order.status === 'draft' || order.status === 'sent' || order.status === 'partial';

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={`Bon de commande — ${order.reference ?? order._id.slice(-8).toUpperCase()}`}
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
            {order.items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-800/40 transition-colors">
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
          orderId={order._id}
          warehouseId={order.warehouse?._id ?? ''}
          items={order.items}
        />
      )}
    </div>
  );
}