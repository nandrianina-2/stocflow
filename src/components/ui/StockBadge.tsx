interface StockBadgeProps {
  quantity:     number;
  minThreshold: number;
}

export function StockBadge({ quantity, minThreshold }: StockBadgeProps) {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-400">
        Vide
      </span>
    );
  }
  if (quantity <= minThreshold) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-400">
        Stock bas
      </span>
    );
  }
  if (quantity <= minThreshold * 1.5) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/15 text-yellow-400">
        Faible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/15 text-green-400">
      OK
    </span>
  );
}