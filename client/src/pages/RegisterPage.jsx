import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { formatApiError } from '@/lib/api';
import t, { images, inputStyle, primaryButtonStyle, labelStyle } from '@/lib/theme';
import { Eye, EyeOff, Camera } from 'lucide-react';
import AuroraBackground from '@/components/AuroraBackground';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', studioName: '', studioAddress: '', phoneNumber: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'studio@example.com' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
    { key: 'studioName', label: 'Studio Name', type: 'text', placeholder: 'My Photography Studio' },
    { key: 'studioAddress', label: 'Studio Address', type: 'text', placeholder: '123 Main Street' },
    { key: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: '+1234567890' },
  ];

  return (
    <div data-testid="register-page" style={{ height: '100vh', background: t.bg, display: 'flex', overflow: 'hidden' }}>
      {/* Left - Image */}
      <div style={{ width: '50%', position: 'relative', overflow: 'hidden' }} className="auth-image-panel">
        <img src={images.registerPage} alt="Photography Studio" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <AuroraBackground />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'flex-end', padding: 48,
          zIndex: 10,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Camera size={28} style={{ color: t.gold }} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 28, color: t.gold }}>Lensifyr</span>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: t.text, lineHeight: 1.4, maxWidth: 380 }}>
              Start delivering photos faster with AI
            </p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }} className="auth-form-panel">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 36, color: t.text, marginBottom: 8 }}>
            Create Account
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textMuted, marginBottom: 32 }}>
            Set up your photography studio in minutes
          </p>

          {error && (
            <div data-testid="register-error" style={{ background: t.danger, border: '1px solid rgba(180,40,40,0.5)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 18 }}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>{label}</label>
                {key === 'password' ? (
                  <div style={{ position: 'relative' }}>
                    <input
                      data-testid={`register-${key}`}
                      type={showPass ? 'text' : type} required value={form[key]}
                      onChange={set(key)} placeholder={placeholder}
                      style={{ ...inputStyle, width: '100%', padding: '11px 44px 11px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(226,201,126,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,201,126,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', padding: 4 }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                ) : (
                  <input
                    data-testid={`register-${key}`}
                    type={type} required value={form[key]}
                    onChange={set(key)} placeholder={placeholder}
                    style={{ ...inputStyle, width: '100%', padding: '11px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(226,201,126,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,201,126,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none'; }}
                  />
                )}
              </div>
            ))}

            <button
              data-testid="register-submit"
              type="submit" disabled={loading}
              style={{ ...primaryButtonStyle, width: '100%', padding: '13px', fontSize: 15, opacity: loading ? 0.6 : 1, marginTop: 8 }}
            >
              {loading ? 'Creating Account...' : 'Create Studio Account'}
            </button>
          </form>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textMuted, textAlign: 'center', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: t.gold, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-image-panel { display: none !important; }
          .auth-form-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
