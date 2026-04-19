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
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
        },
        success: {
          duration: 2800,
        },
      }}
    />
  );
}
