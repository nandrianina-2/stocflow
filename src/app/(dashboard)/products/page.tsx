import { PageHeader } from '@/components/ui/PageHeader';
import { ProductsClient } from './ProductsClient';

export const metadata = { title: 'Produits — StockFlow' };

export default function ProductsPage() {
  return (
    <div>
      <ProductsClient />
    </div>
  );
}