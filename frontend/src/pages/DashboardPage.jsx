import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi, eventApi } from '@/lib/api';
import t, { images, cardStyle, primaryButtonStyle, outlineButtonStyle, badgeStyle } from '@/lib/theme';
import { Calendar, Image, Zap, PlusCircle, Upload, Copy, Check, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    statsApi.getStats().then(r => setStats(r.data)).catch(() => {});
    eventApi.getMyEvents().then(r => setEvents(r.data.events?.slice(0, 5) || [])).catch(() => {});
  }, []);

  const copyStudioId = () => {
    if (user?.studioId) {
      navigator.clipboard.writeText(user.studioId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statCards = [
    { icon: Calendar, label: 'Total Events', value: stats?.totalEvents ?? '-', color: t.gold },
    { icon: Zap, label: 'Active Events', value: stats?.activeEvents ?? '-', color: '#4ade80' },
    { icon: Image, label: 'Total Photos', value: stats?.totalPhotos ?? '-', color: '#60a5fa' },
  ];

  return (
    <div data-testid="dashboard-page">
      {/* Banner */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 32, position: 'relative', height: 200 }}>
        <img src={images.dashboardBanner} alt="Studio Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.4) 100%)', display: 'flex', alignItems: 'center', padding: '0 40px' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 32, color: t.text, marginBottom: 8 }}>
              Welcome back, <span style={{ color: t.gold }}>{user?.name || 'Photographer'}</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.textMuted }}>Studio ID:</span>
              <button data-testid="copy-studio-id" onClick={copyStudioId}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(226,201,126,0.1)', border: '1px solid rgba(226,201,126,0.2)', borderRadius: 8, padding: '4px 12px', color: t.gold, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                {user?.studioId || 'N/A'}
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ ...cardStyle, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <div style={{ color: t.text, fontSize: 26, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>{value}</div>
              <div style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <Link to="/create-event" data-testid="quick-create-event" style={{ ...primaryButtonStyle, textDecoration: 'none', padding: '10px 20px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <PlusCircle size={16} /> Create Event
        </Link>
        <Link to="/upload" data-testid="quick-upload" style={{ ...outlineButtonStyle, textDecoration: 'none', padding: '10px 20px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Upload size={16} /> Upload Photos
        </Link>
      </div>

      {/* Recent Events */}
      <div style={{ ...cardStyle, padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 22, color: t.text, margin: 0 }}>Recent Events</h2>
          <Link to="/events" style={{ color: t.gold, textDecoration: 'none', fontSize: 13, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Calendar size={40} style={{ color: t.textMuted, marginBottom: 12 }} />
            <p style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>No events yet. Create your first event!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.map((event) => (
              <div key={event._id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(226,201,126,0.06)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                <div>
                  <div style={{ color: t.text, fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{event.title}</div>
                  <div style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                    {new Date(event.eventDate).toLocaleDateString()} &middot; {event.imageCount || 0} photos
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...badgeStyle }}>{event.isActive ? 'Active' : 'Closed'}</span>
                  <span style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{event.eventCode}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
