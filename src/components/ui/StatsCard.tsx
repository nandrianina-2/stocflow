import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label:    string;
  value:    string | number;
  icon:     LucideIcon;
  trend?:   string;
  positive?: boolean;
  color?:   'blue' | 'green' | 'yellow' | 'red';
}

const colorMap = {
  blue:   'bg-blue-500/10 text-blue-400',
  green:  'bg-green-500/10 text-green-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
  red:    'bg-red-500/10 text-red-400',
};

export function StatsCard({ label, value, icon: Icon, trend, positive, color = 'blue' }: StatsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {trend && (
        <p className={`text-xs mt-1.5 ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {trend}
        </p>
      )}
    </div>
  );
}