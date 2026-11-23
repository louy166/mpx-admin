'use client';
import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/constants';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadProperties = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, per_page: 20 });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('q', search);
      const res = await fetch('/api/admin/properties?' + params.toString());
      const data = await res.json();
      setProperties(data.data || []);
      setTotalPages(data.total_pages || 0);
      setTotal(data.total || 0);
      setPage(p);
    } catch (err) {
      console.error(err);
      toast.error('Erreur de chargement');
    }
    setLoading(false);
  };

  useEffect(() => { loadProperties(); }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch('/api/admin/properties/' + id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Erreur');
      toast.success('Statut mis a jour');
      loadProperties(page);
    } catch (err) {
      toast.error('Erreur lors de la mise a jour');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des biens</h1>
          <p className="text-gray-500 text-sm mt-1">Gerez et validez les biens immobiliers ({total} au total)</p>
        </div>
      </div>
      <div className="admin-card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadProperties(1)} className="input-field !pl-9 text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field text-sm w-full sm:w-48">
            <option value="">Tout statut</option>
            <option value="brouillon">Brouillon</option>
            <option value="en_verification">En verification</option>
            <option value="publie">Publie</option>
            <option value="rejete">Rejete</option>
          </select>
        </div>
      </div>
      <div className="admin-card overflow-x-auto">
        {loading ? (
          <p className="text-gray-400 py-8 text-center">Chargement...</p>
        ) : properties.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Titre</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden md:table-cell">Ville</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden lg:table-cell">Proprietaire</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Statut</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Prix</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-3"><p className="font-medium text-gray-900">{p.titre}</p><p className="text-gray-400 text-xs">{p.type}</p></td>
                  <td className="py-3 px-3 text-gray-500 hidden md:table-cell">{p.ville}</td>
                  <td className="py-3 px-3 text-gray-500 hidden lg:table-cell">{p.proprietaire ? (p.proprietaire.prenom || '') + ' ' + (p.proprietaire.nom || '') : '-'}</td>
                  <td className="py-3 px-3">
                    <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + (p.status === 'publie' ? 'bg-green-100 text-green-700' : p.status === 'brouillon' ? 'bg-yellow-100 text-yellow-700' : p.status === 'en_verification' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600')}>
                      {p.status === 'publie' ? 'Publie' : p.status === 'brouillon' ? 'Brouillon' : p.status === 'en_verification' ? 'En verification' : 'Rejete'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">{formatPrice(p.prix)}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      {p.status !== 'publie' && (<button onClick={() => handleStatusChange(p.id, 'publie')} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Publier"><HiOutlineCheck size={16} /></button>)}
                      {p.status !== 'rejete' && p.status !== 'brouillon' && (<button onClick={() => handleStatusChange(p.id, 'rejete')} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Rejeter"><HiOutlineX size={16} /></button>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 py-8 text-center">Aucun bien trouve</p>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => loadProperties(page - 1)} disabled={page <= 1} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Precedent</button>
            <span className="text-xs text-gray-400">Page {page} / {totalPages}</span>
            <button onClick={() => loadProperties(page + 1)} disabled={page >= totalPages} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}
