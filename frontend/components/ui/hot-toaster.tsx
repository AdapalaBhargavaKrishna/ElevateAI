'use client';

import { Toaster } from 'react-hot-toast';

export function HotToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          border: '1px solid hsl(var(--border))',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'none',
        },
        success: {
          duration: 2800,
        },
      }}
    />
  );
}
