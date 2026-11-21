import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Foncier Mauritanie — Administration',
  description: 'Back-office de la plateforme Foncier Mauritanie.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
