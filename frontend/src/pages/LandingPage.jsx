import HyperSpeed from '@/components/HyperSpeed';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import t from '@/lib/theme';
import { Link } from 'react-router-dom';
import { Camera, Zap, Shield, Download, Users, Image, Sparkles } from 'lucide-react';
import { cardStyle, primaryButtonStyle, outlineButtonStyle } from '@/lib/theme';

const features = [
  { icon: Camera, title: 'Smart Upload', desc: 'Bulk upload event photos with automatic face detection and indexing.' },
  { icon: Zap, title: 'AI Face Match', desc: 'Guests find their photos instantly with a single selfie.' },
  { icon: Download, title: 'ZIP Download', desc: 'Matched photos delivered as a ready-to-share ZIP file.' },
  { icon: Shield, title: 'Event Codes', desc: 'Secure events with unique codes. Only verified guests access photos.' },
  { icon: Users, title: 'Studio Dashboard', desc: 'Manage events, clients, and photos from one powerful dashboard.' },
  { icon: Image, title: 'Gallery View', desc: 'Beautiful paginated galleries for browsing all event images.' },
];

const stats = [
  { value: '99.8%', label: 'Recognition Accuracy' },
  { value: '< 500ms', label: 'Match Speed' },
  { value: '512D', label: 'Face Embeddings' },
  { value: 'ArcFace', label: 'AI Model' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: t.bg, position: 'relative' }}>
      <HyperSpeed />
      <Navbar />

      {/* Hero */}
      <section data-testid="hero-section" style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>
        <div style={{ textAlign: 'center', maxWidth: 800 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(226,201,126,0.1)', border: '1px solid rgba(226,201,126,0.2)', marginBottom: 32 }}>
            <Sparkles size={14} style={{ color: t.gold }} />
            <span style={{ color: t.gold, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>AI-Powered Photography Platform</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(40px, 7vw, 80px)', color: t.text, lineHeight: 1.1, marginBottom: 24 }}>
            Every Face Tells<br />
            <span style={{ color: t.gold }}>a Story</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: t.textMuted, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Deliver event photos to your guests in seconds, not days. Upload once, let AI handle the rest.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" data-testid="hero-get-started" style={{ ...primaryButtonStyle, textDecoration: 'none', padding: '14px 36px', fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Camera size={18} /> Start Your Studio
            </Link>
            <Link to="/find-photos" data-testid="hero-find-photos" style={{ ...outlineButtonStyle, textDecoration: 'none', padding: '14px 36px', fontSize: 15 }}>
              Find My Photos
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(226,201,126,0.1)', borderRadius: 14, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ color: t.text, fontSize: 28, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif", marginBottom: 4 }}>{s.value}</div>
              <div style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section data-testid="features-section" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 42, color: t.text, textAlign: 'center', marginBottom: 16 }}>
            Built for <span style={{ color: t.gold }}>Professionals</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: t.textMuted, textAlign: 'center', fontSize: 16, marginBottom: 60, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            Everything you need to manage your photography business.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ ...cardStyle, padding: '32px 28px', transition: 'transform 0.3s, box-shadow 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), 0 0 30px rgba(226,201,126,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `${t.shadow}, ${t.goldShadow}`; }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: t.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={20} style={{ color: t.gold }} />
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 22, color: t.text, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textMuted, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', ...cardStyle, padding: '60px 40px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 36, color: t.text, marginBottom: 16 }}>
            Ready to Transform Your <span style={{ color: t.gold }}>Workflow?</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: t.textMuted, marginBottom: 32, lineHeight: 1.7 }}>
            Join photographers who are delivering photos faster and delighting clients with AI-powered matching.
          </p>
          <Link to="/register" style={{ ...primaryButtonStyle, textDecoration: 'none', padding: '14px 40px', fontSize: 15, display: 'inline-block' }}>
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
