'use client';
import { HiOutlineUsers } from 'react-icons/hi';

export default function UsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-500 text-sm mt-1">Gerez les comptes et les roles</p>
      </div>

      <div className="admin-card py-12 text-center">
        <HiOutlineUsers size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Endpoint admin non disponible</p>
        <p className="text-gray-400 text-sm mt-1">
          Le backend ne dispose pas encore d&apos;un endpoint pour lister tous les utilisateurs.
          Ajoutez un endpoint GET /users dans le backend Spring Boot.
        </p>
      </div>
    </div>
  );
}