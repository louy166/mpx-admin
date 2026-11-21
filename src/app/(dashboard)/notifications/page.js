'use client';
import { useState, useEffect } from 'react';
import { HiOutlineBell, HiOutlinePaperAirplane } from 'react-icons/hi';
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: '', message: '', type: 'info' });
  const [sending, setSending] = useState(false);

  const loadNotifications = async (p = 0) => {
    setLoading(true);
    try {
      const params = { page: p, size: 20 };
      const res = await api.getNotifications(params);
      const normalized = normalizePage(res);
      setNotifications(normalized.content);
      setTotalPages(normalized.totalPages);
      setPage(p);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.titre || !form.message) return toast.error('Remplissez tous les champs');
    setSending(true);
    try {
      await api.sendNotification(form);
      toast.success('Notification envoyée');
      setForm({ titre: '', message: '', type: 'info' });
      setShowForm(false);
      loadNotifications(0);
    } catch (err) {
      toast.error('Erreur lors de l\'envoi');
    }
    setSending(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">Envoyez et consultez les notifications</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2">
          <HiOutlinePaperAirplane size={16} />
          Nouvelle notification
        </button>
      </div>

      {showForm && (
        <div className="admin-card mb-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Envoyer une notification</h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                className="input-field text-sm"
                placeholder="Titre de la notification"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-field text-sm"
                rows={3}
                placeholder="Contenu du message"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-field text-sm w-48"
              >
                <option value="info">Information</option>
                <option value="alerte">Alerte</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={sending} className="btn-primary text-sm">
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card overflow-x-auto">
        {loading ? (
          <p className="text-gray-400 py-8 text-center">Chargement...</p>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 border border-gray-50">
                <div className={`mt-0.5 p-2 rounded-lg ${
                  n.type === 'alerte' ? 'bg-red-50 text-red-500'
                    : n.type === 'promotion' ? 'bg-gold/10 text-gold-dark'
                    : 'bg-primary-50 text-primary'
                }`}>
                  <HiOutlineBell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{n.titre}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {n.created_at ? new Date(n.created_at).toLocaleString('fr-FR') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 py-8 text-center">Aucune notification</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => loadNotifications(page - 1)} disabled={page === 0} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Précédent</button>
            <span className="text-xs text-gray-400">Page {page + 1} / {totalPages}</span>
            <button onClick={() => loadNotifications(page + 1)} disabled={page >= totalPages - 1} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}
