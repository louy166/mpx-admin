'use client';
import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineCheck, HiOutlineX, HiOutlineDocumentText } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

function normalizePage(data) {
  if (!data) return { content: [], totalPages: 0, totalElements: 0 };
  return {
    content: data.data || data.content || [],
    totalPages: data.total_pages || data.totalPages || 0,
    totalElements: data.total_elements || data.totalElements || 0,
  };
}

export default function KycPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const loadRequests = async (p = 0) => {
    setLoading(true);
    try {
      const params = { page: p, size: 20 };
      if (statusFilter) params.statut = statusFilter;
      const res = await api.getKycRequests(params);
      const normalized = normalizePage(res);
      setRequests(normalized.content);
      setTotalPages(normalized.totalPages);
      setPage(p);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadRequests(); }, [statusFilter]);

  const handleDecision = async (id, decision) => {
    try {
      await api.updateKycStatus(id, decision);
      toast.success(decision === 'approuve' ? 'KYC approuvé' : 'KYC rejeté');
      loadRequests(page);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Vérification KYC</h1>
        <p className="text-gray-500 text-sm mt-1">Vérifiez et validez les documents d&apos;identité</p>
      </div>

      <div className="admin-card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-sm w-full sm:w-56"
          >
            <option value="">Tout statut</option>
            <option value="en_attente">En attente</option>
            <option value="approuve">Approuvé</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        {loading ? (
          <p className="text-gray-400 py-8 text-center">Chargement...</p>
        ) : requests.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Utilisateur</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden md:table-cell">Type document</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden lg:table-cell">Date</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Statut</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-3">
                    <p className="font-medium text-gray-900">
                      {r.utilisateur ? `${r.utilisateur.prenom || ''} ${r.utilisateur.nom || ''}` : `User #${r.utilisateur_id || r.userId || '?'}`}
                    </p>
                    <p className="text-gray-400 text-xs">{r.utilisateur?.telephone || ''}</p>
                  </td>
                  <td className="py-3 px-3 text-gray-500 hidden md:table-cell">{r.type_document || r.typeDocument || '—'}</td>
                  <td className="py-3 px-3 text-gray-400 text-xs hidden lg:table-cell">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.statut === 'approuve' ? 'bg-green-100 text-green-700'
                        : r.statut === 'en_attente' ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {r.statut || 'en_attente'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      {r.document_url && (
                        <a
                          href={api.resolveFileUrl(r.document_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir document"
                        >
                          <HiOutlineDocumentText size={16} />
                        </a>
                      )}
                      {r.statut !== 'approuve' && (
                        <button
                          onClick={() => handleDecision(r.id, 'approuve')}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          title="Approuver"
                        >
                          <HiOutlineCheck size={16} />
                        </button>
                      )}
                      {r.statut !== 'rejete' && (
                        <button
                          onClick={() => handleDecision(r.id, 'rejete')}
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
          <p className="text-gray-400 py-8 text-center">Aucune demande KYC trouvée</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => loadRequests(page - 1)} disabled={page === 0} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Précédent</button>
            <span className="text-xs text-gray-400">Page {page + 1} / {totalPages}</span>
            <button onClick={() => loadRequests(page + 1)} disabled={page >= totalPages - 1} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}
