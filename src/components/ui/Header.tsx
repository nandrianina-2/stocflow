'use client';

import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  user: {
    name?:  string | null;
    email?: string | null;
    role:   string;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
      <GlobalSearch />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User size={14} strokeWidth={2} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
        >
          <LogOut size={15} strokeWidth={2} />
          Déconnexion
        </button>
      </div>
    </header>
  );
}