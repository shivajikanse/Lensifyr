import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { formatApiError } from '@/lib/api';
import t, { images, inputStyle, primaryButtonStyle, cardStyle, labelStyle } from '@/lib/theme';
import { Eye, EyeOff, Camera } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-page" style={{ minHeight: '100vh', background: t.bg, display: 'flex' }}>
      {/* Left - Image */}
      <div style={{
        flex: 1, display: 'flex', position: 'relative', overflow: 'hidden',
      }} className="auth-image-panel">
        <img src={images.loginPage} alt="Photography Studio" style={{
          width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.7) 100%)',
          display: 'flex', alignItems: 'flex-end', padding: 48,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Camera size={28} style={{ color: t.gold }} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 28, color: t.gold }}>Lensifyr</span>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: t.text, lineHeight: 1.4, maxWidth: 380 }}>
              Your studio command center awaits
            </p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
      }} className="auth-form-panel">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 36, color: t.text, marginBottom: 8 }}>
            Welcome Back
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textMuted, marginBottom: 36 }}>
            Sign in to manage your photography studio
          </p>

          {error && (
            <div data-testid="login-error" style={{ background: t.danger, border: '1px solid rgba(180,40,40,0.5)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>Email</label>
              <input
                data-testid="login-email"
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="studio@example.com"
                style={{ ...inputStyle, width: '100%', padding: '12px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(226,201,126,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,201,126,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = t.inputBorder.replace('1px solid ', ''); e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  data-testid="login-password"
                  type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, width: '100%', padding: '12px 44px 12px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(226,201,126,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(226,201,126,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = t.inputBorder.replace('1px solid ', ''); e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', padding: 4 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              data-testid="login-submit"
              type="submit" disabled={loading}
              style={{ ...primaryButtonStyle, width: '100%', padding: '13px', fontSize: 15, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textMuted, textAlign: 'center', marginTop: 28 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: t.gold, textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-image-panel { display: none !important; }
          .auth-form-panel { flex: 1 !important; }
        }
      `}</style>
    </div>
  );
}
