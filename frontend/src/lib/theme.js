const t = {
  bg: "#0a0a0a",
  card: "rgba(28, 25, 23, 0.85)",
  cardBorder: "rgba(226, 201, 126, 0.12)",
  gold: "#e2c97e",
  goldDim: "rgba(226, 201, 126, 0.12)",
  goldBorder: "rgba(226, 201, 126, 0.25)",
  text: "#f5f0e8",
  textMuted: "rgba(245, 240, 232, 0.45)",
  input: "rgba(255, 255, 255, 0.04)",
  inputBorder: "rgba(226, 201, 126, 0.18)",
  muted: "rgba(255, 255, 255, 0.06)",
  shadow: "0 8px 32px rgba(0,0,0,0.5)",
  goldShadow: "0 0 24px rgba(226,201,126,0.12)",
  danger: "rgba(180, 40, 40, 0.75)",
};

export const images = {
  registerPage: "https://customer-assets.emergentagent.com/job_576bdf42-fcb1-490a-844a-a52fe57b658b/artifacts/kig2p34b_organizer-Register%20-page.webp",
  loginPage: "https://customer-assets.emergentagent.com/job_576bdf42-fcb1-490a-844a-a52fe57b658b/artifacts/pxdzhfbe_Organizer%20login%20page.webp",
  dashboardBanner: "https://customer-assets.emergentagent.com/job_576bdf42-fcb1-490a-844a-a52fe57b658b/artifacts/4pn4fzfo_organizer%20page%20banner.webp",
  errorPage: "https://customer-assets.emergentagent.com/job_576bdf42-fcb1-490a-844a-a52fe57b658b/artifacts/oqev68dp_error-page-image.webp",
};

export const labelStyle = {
  fontSize: "0.75rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: t.textMuted,
  fontFamily: "'DM Sans', sans-serif",
};

export const cardStyle = {
  background: t.card,
  border: `1px solid ${t.cardBorder}`,
  borderRadius: "14px",
  backdropFilter: "blur(12px)",
  boxShadow: `${t.shadow}, ${t.goldShadow}`,
};

export const inputStyle = {
  background: t.input,
  border: `1px solid ${t.inputBorder}`,
  color: t.text,
  borderRadius: "10px",
  fontFamily: "'DM Sans', sans-serif",
};

export const primaryButtonStyle = {
  background: "linear-gradient(90deg, #e2c97e, #f5d9a3, #e2c97e)",
  backgroundSize: "200%",
  color: "#0a0a0a",
  borderRadius: "9px",
  boxShadow: "0 0 20px rgba(226,201,126,0.25)",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
};

export const outlineButtonStyle = {
  background: "transparent",
  border: "1px solid rgba(226,201,126,0.3)",
  color: t.gold,
  borderRadius: "9px",
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
  cursor: "pointer",
};

export const badgeStyle = {
  background: "rgba(226,201,126,0.12)",
  color: t.gold,
  border: "1px solid rgba(226,201,126,0.25)",
  borderRadius: "20px",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.75rem",
  padding: "2px 10px",
};

export default t;
