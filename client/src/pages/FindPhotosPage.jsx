import { useState } from "react";
import { organizerApi, eventApi, imageApi, formatApiError } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import t, {
  cardStyle,
  inputStyle,
  primaryButtonStyle,
  outlineButtonStyle,
  labelStyle,
  badgeStyle,
} from "@/lib/theme";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  KeyRound,
  Camera,
  Download,
  Image,
  Eye,
  Users,
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function FindPhotosPage() {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [organizers, setOrganizers] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventCode, setEventCode] = useState("");
  const [verifiedEvent, setVerifiedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eventImages, setEventImages] = useState([]);
  const [imgPage, setImgPage] = useState(1);
  const [imgTotal, setImgTotal] = useState(0);
  const [selfieFile, setSelfieFile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [mode, setMode] = useState(null);

  const searchOrganizers = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await organizerApi.search(query);
      setOrganizers(data);
      if (data.length === 0)
        setError("No studios found. Try a different search.");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const selectOrganizer = async (org) => {
    setSelectedOrg(org);
    setLoading(true);
    try {
      const { data } = await eventApi.getOrganizerEvents(org._id);
      setOrgEvents(data);
      setStep(2);
    } catch {
      setOrgEvents([]);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const selectEvent = (ev) => {
    setSelectedEvent(ev);
    setStep(3);
  };

  const verifyCode = async () => {
    if (!eventCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await eventApi.verify(eventCode);
      setVerifiedEvent(data.event);
      setStep(4);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const browsePhotos = async (page = 1) => {
    setMode("browse");
    setLoading(true);
    try {
      const eventId = verifiedEvent?._id || selectedEvent?._id;
      const { data } = await imageApi.getEventImages(eventId, page, 20);
      setEventImages(data.images || []);
      setImgPage(data.pagination?.page || 1);
      setImgTotal(data.pagination?.pages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const findMyPhotos = async () => {
    if (!selfieFile) return;
    setMatchLoading(true);
    setError("");
    try {
      const eventId = verifiedEvent?._id || selectedEvent?._id;
      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("selfie", selfieFile);
      const { data } = await imageApi.previewMatches(formData);
      setMatches(data.matches || []);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setMatchLoading(false);
    }
  };

  const downloadMatches = async () => {
    setMatchLoading(true);
    try {
      const eventId = verifiedEvent?._id || selectedEvent?._id;
      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("selfie", selfieFile);
      const response = await imageApi.findMatches(formData);
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "matched_photos.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
    } finally {
      setMatchLoading(false);
    }
  };

  const stepIndicator = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 36,
      }}
    >
      {[1, 2, 3, 4].map((s) => (
        <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: step >= s ? t.goldDim : t.muted,
              border: `1px solid ${step >= s ? t.goldBorder : "rgba(255,255,255,0.08)"}`,
              color: step >= s ? t.gold : t.textMuted,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            {s}
          </div>
          {s < 4 && (
            <div
              style={{
                width: 32,
                height: 1,
                background: step > s ? t.goldBorder : "rgba(255,255,255,0.08)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: t.bg }}>
      <Navbar />
      <div
        style={{
          paddingTop: 96,
          paddingBottom: 80,
          maxWidth: 700,
          margin: "0 auto",
          padding: "96px 24px 80px",
        }}
      >
        <h1
          data-testid="find-photos-title"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 36,
            color: t.text,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Find Your <span style={{ color: t.gold }}>Photos</span>
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: t.textMuted,
            textAlign: "center",
            fontSize: 15,
            marginBottom: 40,
          }}
        >
          Search for your photographer's studio, select your event, and get your
          photos.
        </p>

        {stepIndicator}

        {error && (
          <div
            data-testid="find-photos-error"
            style={{
              background: t.danger,
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: t.text,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Step 1: Search Organizer */}
        {step === 1 && (
          <div
            data-testid="step-search"
            style={{ ...cardStyle, padding: "32px 28px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <Search size={18} style={{ color: t.gold }} />
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: 22,
                  color: t.text,
                  margin: 0,
                }}
              >
                Search Studio
              </h2>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                data-testid="search-studio-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Studio name or ID (e.g. STD_A1B2C3D4)"
                onKeyDown={(e) => e.key === "Enter" && searchOrganizers()}
                style={{
                  ...inputStyle,
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={searchOrganizers}
                disabled={loading}
                style={{
                  ...primaryButtonStyle,
                  padding: "12px 24px",
                  fontSize: 14,
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            {organizers.length > 0 && (
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {organizers.map((org) => (
                  <button
                    key={org._id}
                    data-testid={`org-${org._id}`}
                    onClick={() => selectOrganizer(org)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid rgba(226,201,126,0.1)`,
                      borderRadius: 10,
                      padding: "14px 16px",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.03)")
                    }
                  >
                    <div>
                      <div
                        style={{
                          color: t.text,
                          fontSize: 15,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {org.studioName}
                      </div>
                      <div
                        style={{
                          color: t.textMuted,
                          fontSize: 12,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {org.name} &middot; {org.studioId}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: t.textMuted }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Event */}
        {step === 2 && (
          <div
            data-testid="step-events"
            style={{ ...cardStyle, padding: "32px 28px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Users size={18} style={{ color: t.gold }} />
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: 22,
                    color: t.text,
                    margin: 0,
                  }}
                >
                  {selectedOrg?.studioName} Events
                </h2>
              </div>
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedOrg(null);
                  setError("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            </div>
            {orgEvents.length === 0 ? (
              <p
                style={{
                  color: t.textMuted,
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                No active events found for this studio.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {orgEvents.map((ev) => (
                  <button
                    key={ev._id}
                    data-testid={`event-select-${ev._id}`}
                    onClick={() => selectEvent(ev)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid rgba(226,201,126,0.1)`,
                      borderRadius: 10,
                      padding: "14px 16px",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: t.text,
                          fontSize: 15,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {ev.title}
                      </div>
                      <div
                        style={{
                          color: t.textMuted,
                          fontSize: 12,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {new Date(ev.eventDate).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: t.textMuted }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Enter Event Code */}
        {step === 3 && (
          <div
            data-testid="step-verify"
            style={{ ...cardStyle, padding: "32px 28px", textAlign: "center" }}
          >
            <KeyRound size={36} style={{ color: t.gold, marginBottom: 16 }} />
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: 22,
                color: t.text,
                marginBottom: 8,
              }}
            >
              Enter Event Code
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: t.textMuted,
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              Ask your photographer for the event code.
            </p>
            <div style={{ maxWidth: 320, margin: "0 auto" }}>
              <input
                data-testid="event-code-input"
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                placeholder="e.g. A1B2C3D4"
                style={{
                  ...inputStyle,
                  width: "100%",
                  padding: "14px",
                  fontSize: 20,
                  textAlign: "center",
                  letterSpacing: "0.2em",
                  fontWeight: 600,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={verifyCode}
                disabled={loading}
                data-testid="verify-code-btn"
                style={{
                  ...primaryButtonStyle,
                  width: "100%",
                  padding: "13px",
                  fontSize: 15,
                  marginTop: 16,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                onClick={() => {
                  setStep(2);
                  setError("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  marginTop: 16,
                  padding: 0,
                }}
              >
                Back to events
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Choose Action */}
        {step === 4 && !mode && (
          <div
            data-testid="step-action"
            style={{ ...cardStyle, padding: "36px 28px", textAlign: "center" }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: 24,
                color: t.text,
                marginBottom: 8,
              }}
            >
              {verifiedEvent?.title || selectedEvent?.title}
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: t.textMuted,
                fontSize: 14,
                marginBottom: 32,
              }}
            >
              How would you like to find your photos?
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <button
                data-testid="browse-all-btn"
                onClick={() => browsePhotos()}
                style={{
                  ...cardStyle,
                  padding: "28px 20px",
                  cursor: "pointer",
                  textAlign: "center",
                  border: `1px solid rgba(226,201,126,0.15)`,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = t.goldBorder)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(226,201,126,0.15)")
                }
              >
                <Eye size={28} style={{ color: t.gold, marginBottom: 12 }} />
                <div
                  style={{
                    color: t.text,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 4,
                  }}
                >
                  Browse All
                </div>
                <div
                  style={{
                    color: t.textMuted,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                  }}
                >
                  View all event photos
                </div>
              </button>
              <button
                data-testid="find-my-btn"
                onClick={() => setMode("selfie")}
                style={{
                  ...cardStyle,
                  padding: "28px 20px",
                  cursor: "pointer",
                  textAlign: "center",
                  border: `1px solid rgba(226,201,126,0.15)`,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = t.goldBorder)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(226,201,126,0.15)")
                }
              >
                <Camera size={28} style={{ color: t.gold, marginBottom: 12 }} />
                <div
                  style={{
                    color: t.text,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 4,
                  }}
                >
                  Find My Photos
                </div>
                <div
                  style={{
                    color: t.textMuted,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                  }}
                >
                  Upload selfie to match
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Browse Mode */}
        {mode === "browse" && (
          <div data-testid="browse-gallery">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: 22,
                  color: t.text,
                  margin: 0,
                }}
              >
                Event Gallery
              </h2>
              <button
                onClick={() => setMode(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <ChevronLeft size={14} style={{ verticalAlign: "middle" }} />{" "}
                Back
              </button>
            </div>
            {eventImages.length === 0 ? (
              <div
                style={{ ...cardStyle, padding: "48px", textAlign: "center" }}
              >
                <Image
                  size={40}
                  style={{ color: t.textMuted, marginBottom: 12 }}
                />
                <p
                  style={{
                    color: t.textMuted,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  No photos uploaded yet.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: 12,
                  }}
                >
                  {eventImages.map((img, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 10,
                        overflow: "hidden",
                        aspectRatio: "1",
                        background: t.muted,
                      }}
                    >
                      <img
                        src={`${API_URL}${img.imageUrl}`}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>
                {imgTotal > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 12,
                      marginTop: 20,
                    }}
                  >
                    <button
                      disabled={imgPage <= 1}
                      onClick={() => browsePhotos(imgPage - 1)}
                      style={{
                        ...outlineButtonStyle,
                        padding: "8px 16px",
                        fontSize: 13,
                        opacity: imgPage <= 1 ? 0.4 : 1,
                      }}
                    >
                      Previous
                    </button>
                    <span
                      style={{
                        color: t.textMuted,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        alignSelf: "center",
                      }}
                    >
                      {imgPage} / {imgTotal}
                    </span>
                    <button
                      disabled={imgPage >= imgTotal}
                      onClick={() => browsePhotos(imgPage + 1)}
                      style={{
                        ...outlineButtonStyle,
                        padding: "8px 16px",
                        fontSize: 13,
                        opacity: imgPage >= imgTotal ? 0.4 : 1,
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Selfie Mode */}
        {mode === "selfie" && (
          <div
            data-testid="selfie-mode"
            style={{ ...cardStyle, padding: "32px 28px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: 22,
                  color: t.text,
                  margin: 0,
                }}
              >
                Upload Selfie
              </h2>
              <button
                onClick={() => {
                  setMode(null);
                  setMatches([]);
                  setSelfieFile(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <ChevronLeft size={14} style={{ verticalAlign: "middle" }} />{" "}
                Back
              </button>
            </div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: t.textMuted,
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              Upload a clear selfie and we'll find your matching photos.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
              }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: "32px",
                  borderRadius: 12,
                  border: "2px dashed rgba(226,201,126,0.25)",
                  cursor: "pointer",
                  background: selfieFile
                    ? "rgba(226,201,126,0.04)"
                    : "transparent",
                }}
              >
                <Camera
                  size={32}
                  style={{ color: t.textMuted, marginBottom: 8 }}
                />
                <span
                  style={{
                    color: selfieFile ? t.gold : t.textMuted,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                  }}
                >
                  {selfieFile ? selfieFile.name : "Click to upload selfie"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfieFile(e.target.files?.[0])}
                  style={{ display: "none" }}
                />
              </label>
              <button
                onClick={findMyPhotos}
                disabled={!selfieFile || matchLoading}
                data-testid="find-matches-btn"
                style={{
                  ...primaryButtonStyle,
                  padding: "12px 32px",
                  fontSize: 14,
                  opacity: !selfieFile || matchLoading ? 0.5 : 1,
                }}
              >
                {matchLoading ? "Finding Matches..." : "Find My Photos"}
              </button>
            </div>

            {matches.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 600,
                      fontSize: 18,
                      color: t.text,
                      margin: 0,
                    }}
                  >
                    {matches.length} Match{matches.length !== 1 ? "es" : ""}{" "}
                    Found
                  </h3>
                  <button
                    onClick={downloadMatches}
                    disabled={matchLoading}
                    data-testid="download-matches-btn"
                    style={{
                      ...primaryButtonStyle,
                      padding: "8px 18px",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Download size={14} /> Download ZIP
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 10,
                  }}
                >
                  {matches.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 10,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <img
                        src={`${API_URL}${m.imageUrl}`}
                        alt=""
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ position: "absolute", bottom: 6, left: 6 }}>
                        <span style={{ ...badgeStyle, fontSize: 11 }}>
                          {Math.round(m.similarity * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
