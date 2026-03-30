import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import t from '@/lib/theme';
import { Camera, Menu, X, LogOut, User, Settings, LayoutDashboard, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav
      data-testid="navbar"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${t.cardBorder}`,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Camera size={24} style={{ color: t.gold }} />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, color: t.gold }}>Lensifyr</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link to="/find-photos" style={{ color: t.textMuted, textDecoration: 'none', padding: '8px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = t.gold} onMouseLeave={e => e.target.style.color = t.textMuted}>
              Find Photos
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" style={{ color: t.textMuted, textDecoration: 'none', padding: '8px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => e.target.style.color = t.gold} onMouseLeave={e => e.target.style.color = t.textMuted}>
                  Dashboard
                </Link>
                <button data-testid="logout-btn" onClick={handleLogout}
                  style={{ background: 'transparent', border: `1px solid rgba(226,201,126,0.2)`, color: t.gold, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login-btn" style={{ color: t.textMuted, textDecoration: 'none', padding: '8px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => e.target.style.color = t.gold} onMouseLeave={e => e.target.style.color = t.textMuted}>
                  Login
                </Link>
                <Link to="/register" data-testid="nav-register-btn"
                  style={{ background: 'linear-gradient(90deg, #e2c97e, #f5d9a3, #e2c97e)', backgroundSize: '200%', color: '#0a0a0a', padding: '7px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'transparent', border: 'none', color: t.text, cursor: 'pointer', padding: 4 }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${t.cardBorder}`, padding: '16px 24px',
        }}>
          <Link to="/find-photos" onClick={() => setMenuOpen(false)} style={{ display: 'block', color: t.textMuted, textDecoration: 'none', padding: '12px 0', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>Find Photos</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, textDecoration: 'none', padding: '12px 0', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}><LayoutDashboard size={16} /> Dashboard</Link>
              <Link to="/events" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, textDecoration: 'none', padding: '12px 0', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}><Calendar size={16} /> Events</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, textDecoration: 'none', padding: '12px 0', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}><User size={16} /> Profile</Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMuted, textDecoration: 'none', padding: '12px 0', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}><Settings size={16} /> Settings</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: t.gold, padding: '12px 0', fontSize: 15, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}><LogOut size={16} /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ display: 'block', color: t.textMuted, textDecoration: 'none', padding: '12px 0', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} style={{ display: 'block', color: t.gold, textDecoration: 'none', padding: '12px 0', fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
