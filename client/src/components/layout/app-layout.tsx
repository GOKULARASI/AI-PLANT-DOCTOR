import { useState, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import Navbar from './navbar';
import ErrorBoundary from '../error-boundary';
import FloatingChat from '@/features/chatbot/components/floating-chat';
export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden w-full" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto flex flex-col relative" style={{ padding: '32px', background: 'var(--bg-secondary)' }}>
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 flex items-center justify-center border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          }>
            <ErrorBoundary fallbackMessage="AI Chatbot or page component could not be loaded.">
              <div key={location.pathname} className="flex-1 flex flex-col w-full animate-fade-in">
                <Outlet />
              </div>
            </ErrorBoundary>
          </Suspense>
        </main>
        
        {/* Global Floating Chatbot */}
        <FloatingChat />
      </div>
    </div>
  );
}
