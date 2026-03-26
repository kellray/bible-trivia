import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bible Trivia',
  description: 'Real-time multiplayer Bible Trivia — New World Translation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0f0f1a] text-slate-100">
        {children}
      </body>
    </html>
  );
}
