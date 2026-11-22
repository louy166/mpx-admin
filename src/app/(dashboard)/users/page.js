'use client';
import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineBan } from 'react-icons/hi';
import api from '@/lib/api';
import { ROLES } from '@/lib/constants';

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
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 0);
      setPage(p);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [roleFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-500 text-sm mt-1">Gerez les comptes et les roles</p>
      </div>

      <div className="admin-card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher par nom ou telephone..."
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
            <option value="">Tous les roles</option>
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
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden md:table-cell">Telephone</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Role</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden lg:table-cell">KYC</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium hidden lg:table-cell">Plan</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-3">
                    <p className="font-medium text-gray-900">{u.prenom} {u.nom}</p>
                    <p className="text-gray-400 text-xs">{u.email || '\u2014'}</p>
                  </td>
                  <td className="py-3 px-3 text-gray-500 hidden md:table-cell">{u.telephone}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700'
                        : u.role === 'agent' ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.kyc_verifie ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {u.kyc_verifie ? 'Verifie' : 'En attente'}
                    </span>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell text-gray-500">{u.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 py-8 text-center">Aucun utilisateur trouve</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => loadUsers(page - 1)} disabled={page === 0} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Precedent</button>
            <span className="text-xs text-gray-400">Page {page + 1} / {totalPages}</span>
            <button onClick={() => loadUsers(page + 1)} disabled={page >= totalPages - 1} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}