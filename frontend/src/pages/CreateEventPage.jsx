import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventApi, formatApiError } from '@/lib/api';
import t, { cardStyle, inputStyle, primaryButtonStyle, labelStyle } from '@/lib/theme';
import { Calendar, Check, Copy, ArrowLeft } from 'lucide-react';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', eventDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await eventApi.create({
        title: form.title,
        eventDate: new Date(form.eventDate).toISOString()
      });
      setCreated(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(created.eventCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (created) {
    return (
      <div data-testid="event-created" style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
        <div style={{ ...cardStyle, padding: '48px 36px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Check size={28} style={{ color: '#4ade80' }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 28, color: t.text, marginBottom: 8 }}>Event Created!</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: t.textMuted, fontSize: 14, marginBottom: 28 }}>
            Share this code with your guests so they can access their photos.
          </p>

          <div style={{ marginBottom: 28 }}>
            <div style={{ ...labelStyle, marginBottom: 10 }}>Event Code</div>
            <button onClick={copyCode} data-testid="copy-event-code"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(226,201,126,0.08)', border: '1px solid rgba(226,201,126,0.25)',
                borderRadius: 12, padding: '14px 28px', cursor: 'pointer',
                color: t.gold, fontSize: 24, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700, letterSpacing: '0.15em',
              }}>
              {created.eventCode}
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/upload')}
              style={{ ...primaryButtonStyle, padding: '10px 24px', fontSize: 14 }}>
              Upload Photos
            </button>
            <button onClick={() => { setCreated(null); setForm({ title: '', eventDate: '' }); }}
              style={{ background: 'transparent', border: `1px solid rgba(226,201,126,0.3)`, color: t.gold, borderRadius: 9, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="create-event-page">
      <button onClick={() => navigate('/events')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif", marginBottom: 24, padding: 0 }}>
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 32, color: t.text, marginBottom: 8 }}>
          Create Event
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: t.textMuted, fontSize: 14, marginBottom: 32 }}>
          Set up a new photography event and get a shareable code.
        </p>

        <div style={{ ...cardStyle, padding: '32px 28px' }}>
          {error && (
            <div style={{ background: t.danger, borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>Event Title</label>
              <input
                data-testid="event-title-input"
                type="text" required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Wedding Reception, Corporate Event..."
                style={{ ...inputStyle, width: '100%', padding: '12px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>Event Date</label>
              <input
                data-testid="event-date-input"
                type="date" required value={form.eventDate}
                onChange={e => setForm({ ...form, eventDate: e.target.value })}
                style={{ ...inputStyle, width: '100%', padding: '12px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
              />
            </div>

            <button data-testid="create-event-submit" type="submit" disabled={loading}
              style={{ ...primaryButtonStyle, width: '100%', padding: '13px', fontSize: 15, opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Calendar size={18} />
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
