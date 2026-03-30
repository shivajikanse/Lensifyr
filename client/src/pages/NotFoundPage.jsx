import { Link } from 'react-router-dom';
import t, { images, primaryButtonStyle, outlineButtonStyle } from '@/lib/theme';
import Navbar from '@/components/Navbar';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <Navbar />
      <div data-testid="not-found-page" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)', paddingTop: 64, padding: '100px 24px 60px', textAlign: 'center',
      }}>
        <img src={images.errorPage} alt="404" style={{
          width: '100%', maxWidth: 400, borderRadius: 20, marginBottom: 36,
          opacity: 0.85, filter: 'grayscale(0.2)',
        }} />
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
          fontSize: 'clamp(48px, 8vw, 96px)', color: t.gold, lineHeight: 1, marginBottom: 12,
        }}>
          404
        </h1>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: t.text, marginBottom: 8,
        }}>
          This frame is empty
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: t.textMuted, marginBottom: 36, maxWidth: 400,
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 14 }}>
          <Link to="/" data-testid="go-home-btn" style={{ ...primaryButtonStyle, textDecoration: 'none', padding: '12px 28px', fontSize: 14 }}>
            Go Home
          </Link>
          <Link to="/find-photos" data-testid="find-photos-404-btn" style={{ ...outlineButtonStyle, textDecoration: 'none', padding: '12px 28px', fontSize: 14 }}>
            Find Photos
          </Link>
        </div>
      </div>
    </div>
  );
}
