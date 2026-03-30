import { useState, useEffect, useRef } from 'react';
import { eventApi, imageApi, formatApiError } from '@/lib/api';
import t, { cardStyle, inputStyle, primaryButtonStyle, labelStyle } from '@/lib/theme';
import { Upload as UploadIcon, X, CheckCircle, AlertCircle, Image } from 'lucide-react';

export default function UploadPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    eventApi.getMyEvents().then(r => setEvents(r.data.events || [])).catch(() => {});
  }, []);

  const handleFiles = (newFiles) => {
    const imageFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  const handleUpload = async () => {
    if (!selectedEvent || files.length === 0) return;
    setUploading(true);
    const uploadResults = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('eventId', selectedEvent);
      formData.append('image', file);
      try {
        const { data } = await imageApi.upload(formData);
        uploadResults.push({ name: file.name, success: true, faces: data.image.faceCount });
      } catch (err) {
        uploadResults.push({ name: file.name, success: false, error: formatApiError(err) });
      }
    }

    setResults(uploadResults);
    setFiles([]);
    setUploading(false);
  };

  const successCount = results.filter(r => r.success).length;
  const totalFaces = results.filter(r => r.success).reduce((sum, r) => sum + (r.faces || 0), 0);

  return (
    <div data-testid="upload-page">
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 32, color: t.text, marginBottom: 8 }}>Upload Photos</h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: t.textMuted, fontSize: 14, marginBottom: 32 }}>
        Upload event photos for AI face detection and matching.
      </p>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Event Selection */}
        <div style={{ ...cardStyle, padding: '24px 28px', marginBottom: 20 }}>
          <label style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>Select Event</label>
          <select
            data-testid="upload-event-select"
            value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
            style={{ ...inputStyle, width: '100%', padding: '12px 16px', fontSize: 14, outline: 'none', boxSizing: 'border-box', appearance: 'none' }}>
            <option value="">Choose an event...</option>
            {events.map(ev => (
              <option key={ev._id} value={ev._id}>{ev.title} - {ev.eventCode}</option>
            ))}
          </select>
        </div>

        {/* Drop Zone */}
        <div
          data-testid="upload-drop-zone"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = t.gold; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(226,201,126,0.25)'; }}
          onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(226,201,126,0.25)'; handleFiles(e.dataTransfer.files); }}
          style={{
            ...cardStyle, padding: '48px 28px', textAlign: 'center', cursor: 'pointer',
            border: '2px dashed rgba(226,201,126,0.25)', marginBottom: 20,
            transition: 'border-color 0.2s',
          }}>
          <UploadIcon size={40} style={{ color: t.textMuted, marginBottom: 16 }} />
          <p style={{ color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 15, marginBottom: 4 }}>
            Drag & drop photos here
          </p>
          <p style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
            or click to browse (JPEG, PNG, WebP, max 5MB)
          </p>
          <input ref={fileRef} type="file" multiple accept="image/*" onChange={e => handleFiles(e.target.files)} style={{ display: 'none' }} />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={{ ...cardStyle, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </span>
              <button onClick={() => setFiles([])} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Clear all</button>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < files.length - 1 ? '1px solid rgba(226,201,126,0.06)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Image size={14} style={{ color: t.textMuted }} />
                    <span style={{ color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{f.name}</span>
                    <span style={{ color: t.textMuted, fontSize: 12 }}>({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                  </div>
                  <button onClick={() => removeFile(i)} style={{ background: 'transparent', border: 'none', color: t.textMuted, cursor: 'pointer', padding: 4 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <button data-testid="upload-submit" onClick={handleUpload} disabled={!selectedEvent || uploading}
            style={{ ...primaryButtonStyle, width: '100%', padding: '14px', fontSize: 15, opacity: !selectedEvent || uploading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <UploadIcon size={18} />
            {uploading ? 'Uploading...' : `Upload ${files.length} Photo${files.length > 1 ? 's' : ''}`}
          </button>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div data-testid="upload-results" style={{ ...cardStyle, padding: '24px 28px' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 20, color: t.text, marginBottom: 16 }}>Upload Summary</h3>
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <div style={{ background: 'rgba(74,222,128,0.08)', borderRadius: 10, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
                <div style={{ color: '#4ade80', fontSize: 22, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>{successCount}</div>
                <div style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Uploaded</div>
              </div>
              <div style={{ background: 'rgba(226,201,126,0.08)', borderRadius: 10, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
                <div style={{ color: t.gold, fontSize: 22, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>{totalFaces}</div>
                <div style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Faces Detected</div>
              </div>
              <div style={{ background: 'rgba(180,40,40,0.08)', borderRadius: 10, padding: '12px 20px', flex: 1, textAlign: 'center' }}>
                <div style={{ color: 'rgba(180,40,40,0.9)', fontSize: 22, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>{results.length - successCount}</div>
                <div style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Failed</div>
              </div>
            </div>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < results.length - 1 ? '1px solid rgba(226,201,126,0.06)' : 'none' }}>
                {r.success ? <CheckCircle size={14} style={{ color: '#4ade80' }} /> : <AlertCircle size={14} style={{ color: 'rgba(180,40,40,0.9)' }} />}
                <span style={{ color: t.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif", flex: 1 }}>{r.name}</span>
                {r.success ? (
                  <span style={{ color: t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{r.faces} face(s)</span>
                ) : (
                  <span style={{ color: 'rgba(180,40,40,0.8)', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{r.error}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
