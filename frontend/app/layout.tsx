import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from "next-themes";
import { HotToaster } from "@/components/ui/hot-toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ElevateAI - Career Development Platform',
  description: 'Elevate your career with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={false} disableTransitionOnChange>
          {children}
          <HotToaster />
        </ThemeProvider>

      </body>
    </html>
  );
}