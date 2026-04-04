import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RILSTACK - Professional Financial Management',
  description: 'RILSTACK: Sophisticated Nigerian financial management platform with real Paystack integration, NIN validation, and professional portfolio tracking.',
  keywords: 'finance, budgeting, savings, investments, Nigeria, Paystack, NIN',
  authors: [{ name: 'RILSTACK' }],
  openGraph: {
    title: 'RILSTACK - Financial Management Platform',
    description: 'Professional financial management for Nigerians',
    url: 'https://rilstack.com',
    siteName: 'RILSTACK',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
