import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '@/lib/api';
import t, { cardStyle, primaryButtonStyle, badgeStyle } from '@/lib/theme';
import { Calendar, PlusCircle, Trash2, Copy, Check, Search, Image } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchEvents = async () => {
    try {
      const { data } = await eventApi.getMyEvents();
      setEvents(data.events || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event and all its photos?')) return;
    try {
      await eventApi.delete(id);
      setEvents(events.filter(e => e._id !== id));
    } catch {}
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.eventCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div data-testid="events-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 32, color: t.text, margin: 0 }}>Events</h1>
        <Link to="/create-event" data-testid="create-event-btn" style={{ ...primaryButtonStyle, textDecoration: 'none', padding: '10px 20px', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <PlusCircle size={16} /> New Event
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: t.textMuted }} />
        <input
          data-testid="events-search"
          type="text" placeholder="Search events or codes..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '11px 16px 11px 40px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.inputBorder}`, borderRadius: 10, color: t.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>Loading events...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, ...cardStyle }}>
          <Calendar size={48} style={{ color: t.textMuted, marginBottom: 16 }} />
          <p style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 16, marginBottom: 8 }}>
            {search ? 'No matching events' : 'No events yet'}
          </p>
          {!search && (
            <Link to="/create-event" style={{ color: t.gold, textDecoration: 'none', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
              Create your first event
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map((event) => (
            <div key={event._id} data-testid={`event-card-${event._id}`}
              style={{ ...cardStyle, padding: '20px 24px', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: t.text, margin: 0, marginBottom: 4 }}>{event.title}</h3>
                  <p style={{ color: t.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                    {new Date(event.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span style={{ ...badgeStyle }}>{event.isActive ? 'Active' : 'Closed'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.textMuted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                  <Image size={14} /> {event.imageCount || 0} photos
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid rgba(226,201,126,0.08)', paddingTop: 14 }}>
                <button onClick={() => copyCode(event.eventCode, event._id)} data-testid={`copy-code-${event._id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(226,201,126,0.08)', border: '1px solid rgba(226,201,126,0.15)', borderRadius: 8, padding: '6px 12px', color: t.gold, cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  {copiedId === event._id ? <Check size={12} /> : <Copy size={12} />}
                  {event.eventCode}
                </button>
                <div style={{ flex: 1 }} />
                <button onClick={() => handleDelete(event._id)} data-testid={`delete-event-${event._id}`}
                  style={{ background: 'transparent', border: '1px solid rgba(180,40,40,0.3)', borderRadius: 8, padding: '6px 10px', color: 'rgba(180,40,40,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
