import '../styles/globals.css';
import type { Metadata } from 'next';
import AppNav from '../components/AppNav';

export const metadata: Metadata = {
  title: 'Compliance Copilot for HR (India)',
  description: 'Indian HR compliance assistant for templates, AI editing, and risk analysis.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <AppNav />
        {children}
      </body>
    </html>
  );
}
