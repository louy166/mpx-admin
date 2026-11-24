'use client';
import { useState, useEffect } from 'react';
import { HiOutlineCheck, HiOutlineX, HiOutlineEye, HiOutlineIdentification } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function KycPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kyc');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Erreur de chargement');
    }
    setLoading(false);
  };

  useEffect(() => { loadRequests(); }, []);

  const filtered = statusFilter
    ? requests.filter(r => r.statut_kyc === statusFilter)
    : requests;

  const handleDecision = async (userId, decision) => {
    try {
      await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, decision }),
      });
      toast.success(decision === 'verifie' ? 'KYC approuvé' : 'KYC rejeté');
      loadRequests();
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const statusLabel = (s) => {
    if (s === 'verifie') return 'Vérifié';
    if (s === 'rejete') return 'Rejeté';
    if (s === 'en_cours') return 'En cours';
    return 'En attente';
  };

  const statusColor = (s) => {
    if (s === 'verifie') return 'bg-green-100 text-green-700';
    if (s === 'rejete') return 'bg-red-100 text-red-600';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Vérification KYC
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Vérifiez et validez les documents d'identité des utilisateurs
        </p>
      </div>

      <div className="admin-card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-sm w-full sm:w-56"
          >
            <option value="">Tout statut</option>
            <option value="en_cours">En cours</option>
            <option value="verifie">Vérifié</option>
            <option value="rejete">Rejeté</option>
          </select>
          <div className="text-sm text-gray-400 flex items-center">
            {filtered.length} demande(s)
          </div>
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        {loading ? (
          <p className="text-gray-400 py-8 text-center">Chargement...</p>
        ) : filtered.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Utilisateur</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">NNI</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden md:table-cell">Téléphone</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Statut</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-3">
                    <p className="font-medium text-gray-900">
                      {r.prenom || ''} {r.nom || ''}
                    </p>
                    <p className="text-gray-400 text-xs">{r.email || ''}</p>
                  </td>
                  <td className="py-3 px-3 text-gray-700 font-mono text-xs">{r.nni}</td>
                  <td className="py-3 px-3 text-gray-500 hidden md:table-cell">{r.telephone || '—'}</td>
                  <td className="py-3 px-3">
                    <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + statusColor(r.statut_kyc)}>
                      {statusLabel(r.statut_kyc)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedUser(r)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Voir documents"
                      >
                        <HiOutlineEye size={16} />
                      </button>
                      {r.statut_kyc !== 'verifie' && (
                        <button
                          onClick={() => handleDecision(r.id, 'verifie')}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          title="Vérifier"
                        >
                          <HiOutlineCheck size={16} />
                        </button>
                      )}
                      {r.statut_kyc !== 'rejete' && (
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
          <div className="py-12 text-center">
            <HiOutlineIdentification className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-400">Aucune demande KYC trouvée</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Documents KYC - {selectedUser.prenom} {selectedUser.nom}
              </h2>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <HiOutlineX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">NNI:</span> <span className="font-mono">{selectedUser.nni}</span></div>
                <div><span className="text-gray-500">Tél:</span> {selectedUser.telephone || '—'}</div>
              </div>
              <div className="space-y-3">
                {selectedUser.kyc_recto_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Recto</p>
                    <img src={selectedUser.kyc_recto_url} alt="Recto" className="rounded-lg border max-h-64 object-contain w-full bg-gray-50" />
                  </div>
                )}
                {selectedUser.kyc_verso_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Verso</p>
                    <img src={selectedUser.kyc_verso_url} alt="Verso" className="rounded-lg border max-h-64 object-contain w-full bg-gray-50" />
                  </div>
                )}
                {selectedUser.kyc_selfie_url && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Selfie</p>
                    <img src={selectedUser.kyc_selfie_url} alt="Selfie" className="rounded-lg border max-h-64 object-contain w-full bg-gray-50" />
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                {selectedUser.statut_kyc !== 'verifie' && (
                  <button
                    onClick={() => { handleDecision(selectedUser.id, 'verifie'); setSelectedUser(null); }}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Vérifier
                  </button>
                )}
                {selectedUser.statut_kyc !== 'rejete' && (
                  <button
                    onClick={() => { handleDecision(selectedUser.id, 'rejete'); setSelectedUser(null); }}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Rejeter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}