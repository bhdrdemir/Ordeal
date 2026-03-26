import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SessionProvider from '@/components/session-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ordeal - LLM Benchmark Platform',
  description: 'Test any LLM with your prompts and your rules. Compare quality, speed, and cost across OpenAI, Anthropic, Google, Mistral, and more. Free and open source.',
  icons: {
    icon: [
      {
        url: '/favicon/ordeal-favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="scroll-smooth">
      <head />
      <body className={`${inter.className} bg-slate-50 text-zinc-900 min-h-screen antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
