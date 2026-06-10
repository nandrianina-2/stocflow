'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowLeftRight,
  ShoppingCart,
  Bell,
  Settings,
  BarChart3,
} from 'lucide-react';

const navigation = [
  { label: 'Dashboard',    href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Produits',     href: '/products',    icon: Package          },
  { label: 'Stock',        href: '/stock',       icon: BarChart3        },
  { label: 'Mouvements',   href: '/movements',   icon: ArrowLeftRight   },
  { label: 'Commandes',    href: '/orders',      icon: ShoppingCart     },
  { label: 'Entrepôts',    href: '/warehouses',  icon: Warehouse        },
  { label: 'Alertes',      href: '/alerts',      icon: Bell             },
  { label: 'Paramètres',   href: '/settings',    icon: Settings         },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-white font-bold text-lg tracking-tight">StockFlow</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-600 uppercase tracking-wider">{role}</p>
      </div>
    </aside>
  );
}