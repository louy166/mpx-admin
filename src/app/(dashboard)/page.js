'use client';
import { useState, useEffect } from 'react';
import { HiOutlineOfficeBuilding, HiOutlineUsers, HiOutlineShieldCheck, HiOutlineCurrencyDollar } from 'react-icons/hi';
import api from '@/lib/api';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="admin-card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentProps, setRecentProps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, propsRes] = await Promise.all([
          api.getStats().catch(() => null),
          api.getProperties({ page: 1, per_page: 5 }).catch(() => null),
        ]);
        if (statsRes) setStats(statsRes);
        if (propsRes) {
          setRecentProps(propsRes.data || []);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiOutlineOfficeBuilding} label="Biens totaux" value={stats?.total_properties ?? '...'} color="bg-primary" />
        <StatCard icon={HiOutlineUsers} label="Utilisateurs" value={stats?.total_users ?? '...'} color="bg-blue-500" />
        <StatCard icon={HiOutlineShieldCheck} label="KYC en attente" value={stats?.pending_kyc ?? '...'} color="bg-amber-500" />
        <StatCard icon={HiOutlineCurrencyDollar} label="Revenus (MRU)" value={stats?.total_revenue ? Number(stats.total_revenue).toLocaleString() : '0'} color="bg-green-600" />
      </div>

      <div className="admin-card">
        <h2 className="font-display font-semibold text-lg text-gray-900 mb-4">Biens recents</h2>
        {loading ? (
          <p className="text-gray-400 py-4">Chargement...</p>
        ) : recentProps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Titre</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Ville</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Type</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Statut</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Prix</th>
                </tr>
              </thead>
              <tbody>
                {recentProps.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-2 font-medium text-gray-900">{p.titre}</td>
                    <td className="py-3 px-2 text-gray-500">{p.ville}</td>
                    <td className="py-3 px-2 text-gray-500">{p.type}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'publie' ? 'bg-green-100 text-green-700'
                          : p.status === 'brouillon' ? 'bg-gray-100 text-gray-600'
                          : p.status === 'en_verification' ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{Number(p.prix || 0).toLocaleString()} MRU</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 py-4">Aucun bien</p>
        )}
      </div>
    </div>
  );
}