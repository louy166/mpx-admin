'use client';
import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineBan } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';

function normalizePage(data) {
  if (!data) return { content: [], totalPages: 0, totalElements: 0 };
  return {
    content: data.data || data.content || [],
    totalPages: data.total_pages || data.totalPages || 0,
    totalElements: data.total_elements || data.totalElements || 0,
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadUsers = async (p = 0) => {
    setLoading(true);
    try {
      const params = { page: p, size: 20 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.q = search;
      const res = await api.getUsers(params);
      const normalized = normalizePage(res);
      setUsers(normalized.content);
      setTotalPages(normalized.totalPages);
      setPage(p);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      toast.success('Rôle mis à jour');
      loadUsers(page);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await api.toggleUserActive(userId, !currentActive);
      toast.success(currentActive ? 'Utilisateur désactivé' : 'Utilisateur activé');
      loadUsers(page);
    } catch (err) {
      toast.error('Erreur');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les comptes et les rôles</p>
      </div>

      <div className="admin-card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers(0)}
              className="input-field !pl-9 text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field text-sm w-full sm:w-48"
          >
            <option value="">Tous les rôles</option>
            {ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        {loading ? (
          <p className="text-gray-400 py-8 text-center">Chargement...</p>
        ) : users.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Nom</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden md:table-cell">Téléphone</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Rôle</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden lg:table-cell">Statut</th>
                <th className="text-right py-3 px-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-3">
                    <p className="font-medium text-gray-900">{u.prenom} {u.nom}</p>
                    <p className="text-gray-400 text-xs">{u.email || '—'}</p>
                  </td>
                  <td className="py-3 px-3 text-gray-500 hidden md:table-cell">{u.telephone}</td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role || ''}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {u.active !== false ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleActive(u.id, u.active !== false)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.active !== false
                            ? 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                            : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                        }`}
                        title={u.active !== false ? 'Désactiver' : 'Activer'}
                      >
                        {u.active !== false ? <HiOutlineBan size={16} /> : <HiOutlineShieldCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 py-8 text-center">Aucun utilisateur trouvé</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => loadUsers(page - 1)} disabled={page === 0} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Précédent</button>
            <span className="text-xs text-gray-400">Page {page + 1} / {totalPages}</span>
            <button onClick={() => loadUsers(page + 1)} disabled={page >= totalPages - 1} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}
