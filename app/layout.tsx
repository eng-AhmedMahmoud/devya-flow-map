import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Devya — System Flow Map',
  description: 'How the Devya apps fit together: who logs in where, what each app does, where data flows.',
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-ink-900 text-ink-100">{children}</body>
    </html>
  );
}
