import { ProductForm } from '@/components/forms/ProductForm';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = { title: 'Nouveau produit — StockFlow' };

export default function NewProductPage() {
  return (
    <div className="">
      <PageHeader
        title="Nouveau produit"
        description="Ajouter un produit au catalogue"
      />
      <ProductForm />
    </div>
  );
}