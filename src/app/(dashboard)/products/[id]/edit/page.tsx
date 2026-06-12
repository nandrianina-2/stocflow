import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Supplier from '@/models/Supplier';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductForm } from '@/components/forms/ProductForm';

async function getProduct(id: string) {
  const session = await auth();
  if (!session) return null;

  await connectDB();

  const product = await Product.findById(id)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .lean();

  return product;
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
        description={(product as any).name}
      />
      <ProductForm
        mode="edit"
        defaultValues={{
          _id:         (product as any)._id.toString(),
          name:        (product as any).name,
          sku:         (product as any).sku,
          description: (product as any).description,
          type:        (product as any).type,
          category:    (product as any).category?._id?.toString() ?? '',
          supplier:    (product as any).supplier?._id?.toString() ?? '',
          isActive:    (product as any).isActive,
        }}
      />
    </div>
  );
}