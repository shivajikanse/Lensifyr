import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { organizerApi, formatApiError } from '@/lib/api';
import t, { cardStyle, inputStyle, primaryButtonStyle, labelStyle } from '@/lib/theme';
import { User, Copy, Check, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: '', studioName: '', studioAddress: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        studioName: user.studioName || '',
        studioAddress: user.studioAddress || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await organizerApi.updateProfile(form);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(user?.studioId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div data-testid="profile-page">
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 32, color: t.text, marginBottom: 32 }}>Profile</h1>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Studio ID Card */}
        <div style={{ ...cardStyle, padding: '24px 28px' }}>
          <div style={{ ...labelStyle, marginBottom: 10 }}>Your Studio ID</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: t.gold, fontSize: 20, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>
              {user?.studioId || 'N/A'}
            </span>
            <button onClick={copyId} data-testid="profile-copy-id"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(226,201,126,0.08)', border: '1px solid rgba(226,201,126,0.2)', borderRadius: 8, padding: '6px 12px', color: t.gold, cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>
            Share this ID with clients so they can find your studio and events.
          </p>
        </div>

        {/* Edit Form */}
        <div style={{ ...cardStyle, padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} style={{ color: t.gold }} />
            </div>
            <div>
              <div style={{ color: t.text, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 15 }}>{user?.name}</div>
              <div style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{user?.email}</div>
            </div>
          </div>

          {error && (
            <div style={{ background: t.danger, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ color: '#4ade80', fontSize: 13, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>Profile updated successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Your name' },
              { key: 'studioName', label: 'Studio Name', placeholder: 'Studio name' },
              { key: 'studioAddress', label: 'Studio Address', placeholder: 'Studio address' },
              { key: 'phoneNumber', label: 'Phone Number', placeholder: 'Phone number' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 18 }}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>{label}</label>
                <input
                  data-testid={`profile-${key}`}
                  type="text" value={form[key]} onChange={set(key)}
                  placeholder={placeholder}
                  style={{ ...inputStyle, width: '100%', padding: '11px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <button data-testid="profile-save" type="submit" disabled={loading}
              style={{ ...primaryButtonStyle, padding: '11px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.6 : 1 }}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
