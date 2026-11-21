'use client';
import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineCreditCard } from 'react-icons/hi';
import api from '@/lib/api';

function normalizePage(data) {
  if (!data) return { content: [], totalPages: 0, totalElements: 0 };
  return {
    content: data.data || data.content || [],
    totalPages: data.total_pages || data.totalPages || 0,
    totalElements: data.total_elements || data.totalElements || 0,
  };
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadSubscriptions = async (p = 0) => {
    setLoading(true);
    try {
      const params = { page: p, size: 20 };
      const res = await api.getSubscriptions(params);
      const normalized = normalizePage(res);
      setSubscriptions(normalized.content);
      setTotalPages(normalized.totalPages);
      setPage(p);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadSubscriptions(); }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Abonnements</h1>
        <p className="text-gray-500 text-sm mt-1">Suivez les abonnements et paiements</p>
      </div>

      <div className="admin-card overflow-x-auto">
        {loading ? (
          <p className="text-gray-400 py-8 text-center">Chargement...</p>
        ) : subscriptions.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Utilisateur</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden md:table-cell">Plan</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden lg:table-cell">Début</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden lg:table-cell">Fin</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Statut</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-3">
                    <p className="font-medium text-gray-900">
                      {s.utilisateur ? `${s.utilisateur.prenom || ''} ${s.utilisateur.nom || ''}` : `User #${s.utilisateur_id || s.userId || '?'}`}
                    </p>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <HiOutlineCreditCard className="text-gold" size={16} />
                      <span className="text-gray-700 font-medium">{s.plan || s.type_plan || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-400 text-xs hidden lg:table-cell">
                    {s.date_debut ? new Date(s.date_debut).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="py-3 px-3 text-gray-400 text-xs hidden lg:table-cell">
                    {s.date_fin ? new Date(s.date_fin).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.statut === 'actif' ? 'bg-green-100 text-green-700'
                        : s.statut === 'expire' ? 'bg-gray-100 text-gray-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {s.statut || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-gray-900">
                    {s.montant ? `${s.montant.toLocaleString()} MRU` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 py-8 text-center">Aucun abonnement trouvé</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => loadSubscriptions(page - 1)} disabled={page === 0} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Précédent</button>
            <span className="text-xs text-gray-400">Page {page + 1} / {totalPages}</span>
            <button onClick={() => loadSubscriptions(page + 1)} disabled={page >= totalPages - 1} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}
