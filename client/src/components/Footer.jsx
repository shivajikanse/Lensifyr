import t from '@/lib/theme';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer data-testid="footer" style={{ background: 'rgba(10,10,10,0.95)', borderTop: `1px solid ${t.cardBorder}`, padding: '48px 24px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Camera size={20} style={{ color: t.gold }} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20, color: t.gold }}>Lensifyr</span>
            </div>
            <p style={{ color: t.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
              AI-powered face recognition for photography studios. Deliver photos faster, delight your clients.
            </p>
          </div>
          <div>
            <h4 style={{ color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/find-photos" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Find Photos</Link>
              <Link to="/register" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Get Started</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Studio</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/dashboard" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Dashboard</Link>
              <Link to="/events" style={{ color: t.textMuted, textDecoration: 'none', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Events</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid rgba(226,201,126,0.08)`, paddingTop: 20, textAlign: 'center' }}>
          <p style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
            &copy; {new Date().getFullYear()} Lensifyr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
