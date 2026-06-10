import { PageHeader } from '@/components/ui/PageHeader';
import { StockClient } from './StockClient';

export const metadata = { title: 'Stock — StockFlow' };

export default function StockPage() {
  return (
    <div>
      <StockClient />
    </div>
  );
}