import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductForm } from '@/components/forms/ProductForm';

async function getProduct(id: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Modifier le produit"
        description={product.name}
      />
      <ProductForm
        mode="edit"
        defaultValues={{
          _id:         product._id,
          name:        product.name,
          sku:         product.sku,
          description: product.description,
          type:        product.type,
          category:    product.category?._id ?? '',
          supplier:    product.supplier?._id ?? '',
          isActive:    product.isActive,
        }}
      />
    </div>
  );
}