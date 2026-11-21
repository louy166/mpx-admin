'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlinePhone, HiOutlineLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/lib/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) return;
    setLoading(true);
    try {
      // Request OTP silently, then verify with the password as OTP code
      await api.requestOtp(phone).catch(() => {});
      const res = await api.verifyOtp(phone, password);
      login(res.access_token, res.refresh_token);
      const user = await api.getMe();
      useAuthStore.getState().setUser(user);
      if (!['admin', 'verificateur'].includes(user.role)) {
        toast.error('Accès réservé aux administrateurs');
        api.logout();
        useAuthStore.getState().logout();
        setLoading(false);
        return;
      }
      toast.success('Bienvenue !');
      router.push('/');
    } catch (err) {
      toast.error('Identifiants incorrects');
    }
    setLoading(false);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="font-display text-2xl font-bold text-white">FM</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Administration</h1>
            <p className="text-gray-500 text-sm mt-1">Foncier Mauritanie - Back Office</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+222..."
                    className="input-field !pl-10"
                    required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="input-field !pl-10"
                    required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
  );
}