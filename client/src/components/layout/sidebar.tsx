import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import {
  LayoutDashboard, Leaf, ScanLine, FlaskConical, Droplets, Sprout, BookOpen, Bug,
  MessageCircle, CloudSun, Bell, FileText, Settings, Shield, TrendingUp, Activity, Radio
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navGroups = [
  {
    label: 'MAIN',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/plants', icon: Leaf, label: 'My Plants' },
      { path: '/scan', icon: ScanLine, label: 'Disease Scan' },
    ],
  },
  {
    label: 'AI TOOLS',
    items: [
      { path: '/treatment', icon: Activity, label: 'Treatment' },
      { path: '/fertilizer', icon: FlaskConical, label: 'Fertilizer' },
      { path: '/water-scheduler', icon: Droplets, label: 'Water Schedule' },
      { path: '/chatbot', icon: MessageCircle, label: 'AI Chatbot' },
    ],
  },
  {
    label: 'TRACK & LEARN',
    items: [
      { path: '/growth', icon: TrendingUp, label: 'Growth Tracker' },
      { path: '/plant-library', icon: BookOpen, label: 'Plant Library' },
      { path: '/disease-library', icon: Bug, label: 'Disease Library' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { path: '/weather', icon: CloudSun, label: 'Weather' },
      { path: '/outbreak-radar', icon: Radio, label: 'Outbreak Radar' },
      { path: '/reports', icon: FileText, label: 'Reports' },
      { path: '/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  const sidebarWidth = collapsed ? '72px' : '260px'; // From user requirements: 260px existing sidebar width

  return (
    <aside 
      className="h-full flex flex-col border-r relative z-20 flex-shrink-0 transition-all duration-300"
      style={{ 
        width: sidebarWidth, 
        background: 'var(--bg-sidebar)', 
        borderColor: 'var(--border-default)' 
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-16 px-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border-default)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent, #059669)' }}>
          <Sprout className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-lg whitespace-nowrap overflow-hidden"
            style={{ color: 'var(--text-primary)' }}>
            PlantSense.
          </span>
        )}
      </div>

      {/* Primary Navigation Container */}
      <nav className="flex-1 overflow-y-auto pt-6 pb-6" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
        <div className="flex flex-col gap-[26px]">
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {!collapsed && (
                <div 
                  className="px-4 text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {group.label}
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <NavLink 
                      key={item.path} 
                      to={item.path}
                      className="flex items-center gap-3 transition-colors duration-200"
                      style={{ 
                        height: '44px',
                        padding: '0 16px',
                        borderRadius: '12px',
                        background: isActive ? 'var(--accent-bg, rgba(5, 150, 105, 0.1))' : 'transparent',
                        color: isActive ? 'var(--accent, #059669)' : 'var(--text-secondary)'
                      }}
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0 opacity-90" />
                      {!collapsed && (
                        <span className="text-[14px] font-semibold whitespace-nowrap overflow-hidden">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin Tools Section */}
          {user?.role === 'admin' && (
            <div className="flex flex-col gap-1 mt-2 border-t pt-6" style={{ borderColor: 'var(--border-default)' }}>
              {!collapsed && (
                <div className="px-4 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  ADMINISTRATION
                </div>
              )}
              <NavLink 
                to="/admin"
                className="flex items-center gap-3 transition-colors duration-200"
                style={{ 
                  height: '44px', padding: '0 16px', borderRadius: '12px',
                  background: location.pathname.startsWith('/admin') ? 'var(--accent-bg, rgba(5, 150, 105, 0.1))' : 'transparent',
                  color: location.pathname.startsWith('/admin') ? 'var(--accent, #059669)' : 'var(--text-secondary)'
                }}
              >
                <Shield className="w-[18px] h-[18px] flex-shrink-0 opacity-90" />
                {!collapsed && <span className="text-[14px] font-semibold">Admin Panel</span>}
              </NavLink>
            </div>
          )}
        </div>
      </nav>

    </aside>
  );
}
