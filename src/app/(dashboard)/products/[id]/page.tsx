import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ProductVariantsClient } from './ProductVariantsClient';
import { Pencil } from 'lucide-react';

interface Product {
  _id:         string;
  name:        string;
  sku:         string;
  type:        string;
  description: string;
  isActive:    boolean;
  category:    { name: string } | null;
  supplier:    { name: string; email: string; phone: string } | null;
  tags:        string[];
  createdAt:   string;
}

const typeLabels: Record<string, string> = {
  physical:     'Physique',
  raw_material: 'Matière première',
  equipment:    'Équipement',
};

async function getProduct(id: string): Promise<Product | null> {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={product.name}
        description={`SKU : ${product.sku}`}
        action={
          <Link
            href={`/products/${product._id}/edit`}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Pencil size={14} />
            Modifier
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Informations</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Type</p>
              <Badge label={typeLabels[product.type] ?? product.type} variant="info" />
            </div>
            <div>
              <p className="text-gray-500 mb-1">Statut</p>
              <Badge label={product.isActive ? 'Actif' : 'Inactif'} variant={product.isActive ? 'success' : 'danger'} />
            </div>
            <div>
              <p className="text-gray-500 mb-1">Catégorie</p>
              <p className="text-white">{product.category?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Créé le</p>
              <p className="text-white">
                {new Date(product.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {product.description && (
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Description</p>
                <p className="text-white">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Fournisseur</h2>
          {product.supplier ? (
            <div className="text-sm space-y-2">
              <p className="text-white font-medium">{product.supplier.name}</p>
              {product.supplier.email && <p className="text-gray-400">{product.supplier.email}</p>}
              {product.supplier.phone && <p className="text-gray-400">{product.supplier.phone}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Aucun fournisseur</p>
          )}
        </div>
      </div>

      <ProductVariantsClient productId={product._id} />
    </div>
  );
}