'use client';
import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineEye, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getStatusColor, getStatusLabel, formatPrice } from '@/lib/constants';

function normalizePage(data) {
  if (!data) return { content: [], totalPages: 0, totalElements: 0 };
  return {
    content: data.data || data.content || [],
    totalPages: data.total_pages || data.totalPages || 0,
    totalElements: data.total_elements || data.totalElements || 0,
  };
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadProperties = async (p = 0) => {
    setLoading(true);
    try {
      const params = { page: p, size: 20 };
      if (statusFilter) params.statut = statusFilter;
      if (search) params.q = search;
      const res = await api.getProperties(params);
      const normalized = normalizePage(res);
      setProperties(normalized.content);
      setTotalPages(normalized.totalPages);
      setPage(p);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadProperties(); }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updatePropertyStatus(id, newStatus);
      toast.success(`Statut mis à jour: ${newStatus}`);
      loadProperties(page);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des biens</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez et validez les biens immobiliers</p>
        </div>
      </div>

      <div className="admin-card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadProperties(0)}
              className="input-field !pl-9 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-sm w-full sm:w-48"
          >
            <option value="">Tout statut</option>
            <option value="brouillon">Brouillon</option>
            <option value="en_verification">En vérification</option>
            <option value="publie">Publié</option>
            <option value="rejete">Rejeté</option>
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
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden lg:table-cell">Propriétaire</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Statut</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Prix</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-3">
                    <p className="font-medium text-gray-900">{p.titre}</p>
                    <p className="text-gray-400 text-xs">{p.type}</p>
                  </td>
                  <td className="py-3 px-3 text-gray-500 hidden md:table-cell">{p.ville}</td>
                  <td className="py-3 px-3 text-gray-500 hidden lg:table-cell">
                    {p.proprietaire ? `${p.proprietaire.prenom || ''} ${p.proprietaire.nom || ''}` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.statut === 'publie' ? 'bg-green-100 text-green-700'
                        : p.statut === 'brouillon' ? 'bg-gray-100 text-gray-600'
                        : p.statut === 'en_verification' ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {p.statut}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">{formatPrice(p.prix)}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      {p.statut !== 'publie' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'publie')}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          title="Publier"
                        >
                          <HiOutlineCheck size={16} />
                        </button>
                      )}
                      {p.statut !== 'rejete' && p.statut !== 'brouillon' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'rejete')}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Rejeter"
                        >
                          <HiOutlineX size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 py-8 text-center">Aucun bien trouvé</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => loadProperties(page - 1)}
              disabled={page === 0}
              className="text-sm text-gray-500 hover:text-primary disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-xs text-gray-400">Page {page + 1} / {totalPages}</span>
            <button
              onClick={() => loadProperties(page + 1)}
              disabled={page >= totalPages - 1}
              className="text-sm text-gray-500 hover:text-primary disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
