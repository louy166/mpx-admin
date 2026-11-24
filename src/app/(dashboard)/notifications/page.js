'use client';
import { useState, useEffect } from 'react';
import { HiOutlineBell, HiOutlinePaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';

function normalizePage(data) {
  if (!data) return { content: [], totalPages: 0, totalElements: 0 };
  return {
    content: data.data || data.content || [],
    totalPages: data.total_pages || data.totalPages || 0,
    totalElements: data.total || data.totalElements || 0,
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
      const res = await fetch('/api/admin/notifications?page=' + (p + 1) + '&per_page=20');
      const data = await res.json();
      const normalized = normalizePage(data);
      setNotifications(normalized.content);
      setTotalPages(normalized.totalPages);
      setPage(p);
    } catch (err) {
      console.error(err);
      toast.error('Erreur de chargement');
    }
    setLoading(false);
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.titre || !form.message) return toast.error('Remplissez tous les champs');
    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur');
      toast.success('Notification envoy\u00e9e \u00e0 tous les utilisateurs');
      setForm({ titre: '', message: '', type: 'info' });
      setShowForm(false);
      loadNotifications(0);
    } catch (err) {
      toast.error("Erreur lors de l'envoi");
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
              <input type="text" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className="input-field text-sm" placeholder="Titre de la notification" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field text-sm" rows={3} placeholder="Contenu du message" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field text-sm w-48">
                <option value="info">Information</option>
                <option value="alerte">Alerte</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={sending} className="btn-primary text-sm">{sending ? 'Envoi...' : 'Envoyer'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Annuler</button>
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
                <div className={"mt-0.5 p-2 rounded-lg " + (n.type === 'alerte' ? 'bg-red-50 text-red-500' : n.type === 'promotion' ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600')}>
                  <HiOutlineBell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{n.titre}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-gray-400 text-xs">{n.created_at ? new Date(n.created_at).toLocaleString('fr-FR') : ''}</p>
                    {n.destinataire && <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{n.destinataire}</span>}
                    <span className={"text-xs px-2 py-0.5 rounded " + (n.lu ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600')}>{n.lu ? 'Lu' : 'Non lu'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 py-8 text-center">Aucune notification</p>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => loadNotifications(page - 1)} disabled={page === 0} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Pr\u00e9c\u00e9dent</button>
            <span className="text-xs text-gray-400">Page {page + 1} / {totalPages}</span>
            <button onClick={() => loadNotifications(page + 1)} disabled={page >= totalPages - 1} className="text-sm text-gray-500 hover:text-primary disabled:opacity-40">Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}
