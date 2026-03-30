export default function AuroraBackground() {
  return (
    <div data-testid="aurora-background" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Layer 1 — slow floating gold shimmer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          background: 'linear-gradient(135deg, rgba(226,201,126,0.08) 0%, rgba(226,201,126,0) 50%)',
          animation: 'aurora-float 8s ease-in-out infinite',
        }}
      />
      {/* Layer 2 — reverse pulse, subtle purple-gold */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          background: 'linear-gradient(45deg, rgba(168,85,247,0.05) 0%, rgba(226,201,126,0.05) 100%)',
          animation: 'aurora-pulse 6s ease-in-out infinite reverse',
        }}
      />
      {/* Layer 3 — dark vignette so text stays readable */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
    </div>
  );
}
