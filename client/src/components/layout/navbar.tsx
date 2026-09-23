import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Bell, Search, Menu, LogOut, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b flex items-center justify-between flex-shrink-0"
      style={{ padding: '0 32px', background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-light)' }} />
          <input type="text" placeholder="Search plants, diseases..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button onClick={() => navigate('/notifications')}
          className="relative p-2.5 rounded-xl transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-secondary)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border overflow-hidden z-50 shadow-lg"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                  <div className="p-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-light)' }}>{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors hover:opacity-80"
                      style={{ color: 'var(--text-secondary)' }}>
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors hover:opacity-80"
                      style={{ color: 'var(--text-secondary)' }}>
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <div className="my-1 border-t" style={{ borderColor: 'var(--border-light)' }} />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
