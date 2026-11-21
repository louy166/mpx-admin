'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { useState } from 'react';
import useAuthStore from '@/lib/auth-store';

const NAV_ITEMS = [
  { href: '/', label: 'Tableau de bord', icon: HiOutlineHome },
  { href: '/properties', label: 'Biens', icon: HiOutlineOfficeBuilding },
  { href: '/users', label: 'Utilisateurs', icon: HiOutlineUsers },
  { href: '/kyc', label: 'Vérification KYC', icon: HiOutlineShieldCheck },
  { href: '/subscriptions', label: 'Abonnements', icon: HiOutlineCreditCard },
  { href: '/notifications', label: 'Notifications', icon: HiOutlineBell },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const nav = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
            <span className="font-display font-bold text-primary-dark text-sm">FM</span>
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">Foncier Mauritanie</p>
            <p className="text-white/50 text-xs">Administration</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-white/15 text-white font-medium'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {(user.prenom?.[0] || '') + (user.nom?.[0] || '')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{user.prenom} {user.nom}</p>
              <p className="text-white/40 text-xs">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <HiOutlineLogout size={18} />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg"
      >
        {open ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-primary-dark flex flex-col z-40 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {nav}
      </aside>
    </>
  );
}
