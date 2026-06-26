import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--c-bg)' }}>
      <Sidebar />
      <Topbar />
      <main
        className="pt-16 min-h-screen"
        style={{ marginLeft: '248px' }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
