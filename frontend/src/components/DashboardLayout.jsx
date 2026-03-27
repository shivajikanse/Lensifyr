import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import t from '@/lib/theme';
import { LayoutDashboard, Calendar, PlusCircle, Upload, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Navbar from './Navbar';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/create-event', icon: PlusCircle, label: 'Create Event' },
  { to: '/upload', icon: Upload, label: 'Upload Photos' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  useAuth();

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <Navbar />
      <div style={{ display: 'flex', paddingTop: 64 }}>
        {/* Sidebar */}
        <aside
          data-testid="dashboard-sidebar"
          style={{
            width: collapsed ? 68 : 240,
            minHeight: 'calc(100vh - 64px)',
            background: 'rgba(28, 25, 23, 0.5)',
            borderRight: `1px solid ${t.cardBorder}`,
            transition: 'width 0.3s ease',
            position: 'sticky', top: 64,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, padding: '16px 8px' }}>
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to} to={to}
                  data-testid={`sidebar-${label.toLowerCase().replace(/\s/g, '-')}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: collapsed ? '12px 20px' : '10px 16px',
                    marginBottom: 4, borderRadius: 10,
                    textDecoration: 'none',
                    background: active ? t.goldDim : 'transparent',
                    color: active ? t.gold : t.textMuted,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              );
            })}
          </div>
          <button
            data-testid="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'transparent', border: 'none', color: t.textMuted,
              padding: '16px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              borderTop: `1px solid ${t.cardBorder}`,
            }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 40px', minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [data-testid="dashboard-sidebar"] { display: none; }
          main { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
