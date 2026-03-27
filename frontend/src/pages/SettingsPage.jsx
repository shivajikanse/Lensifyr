import t, { cardStyle, labelStyle } from '@/lib/theme';
import { Settings as SettingsIcon, Moon, Info, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div data-testid="settings-page">
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 32, color: t.text, marginBottom: 32 }}>Settings</h1>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Appearance */}
        <div style={{ ...cardStyle, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Moon size={18} style={{ color: t.gold }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: t.text, margin: 0 }}>Appearance</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(226,201,126,0.06)' }}>
            <div>
              <div style={{ color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>Dark Mode</div>
              <div style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>Always on for the best studio experience</div>
            </div>
            <div style={{
              width: 44, height: 24, borderRadius: 12,
              background: 'linear-gradient(90deg, #e2c97e, #f5d9a3)',
              position: 'relative', cursor: 'default',
            }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0a0a0a', position: 'absolute', right: 3, top: 3, transition: 'all 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Account */}
        <div style={{ ...cardStyle, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Shield size={18} style={{ color: t.gold }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: t.text, margin: 0 }}>Account</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'transparent', border: 'none', color: t.text,
              padding: '12px 0', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
              borderBottom: '1px solid rgba(226,201,126,0.06)', width: '100%', textAlign: 'left',
            }}>
              Change Password
              <span style={{ color: t.textMuted, fontSize: 12 }}>Coming soon</span>
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'transparent', border: 'none', color: 'rgba(180,40,40,0.8)',
              padding: '12px 0', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 14,
              width: '100%', textAlign: 'left',
            }}>
              Delete Account
              <span style={{ color: t.textMuted, fontSize: 12 }}>Coming soon</span>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div style={{ ...cardStyle, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Info size={18} style={{ color: t.gold }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: t.text, margin: 0 }}>About</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'AI Model', value: 'ArcFace (512D)' },
              { label: 'Detector', value: 'RetinaFace' },
              { label: 'Accuracy', value: '99.8%' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ ...labelStyle }}>{label}</span>
                <span style={{ color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
