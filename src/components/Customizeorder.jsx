import React, { useState, useRef, useEffect } from "react";
import "../css/Customizeorder.css";
import api from "../services/api";

/* ── Icons ── */
const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconMic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const IconStop = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
  </svg>
);
const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCheck = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconPause = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);

/* ── Helpers ── */
const fmtTime = (sec) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};
const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/* ── Voice Recorder ── */
function VoiceRecorder({ onRecordingChange }) {
  const [state, setState] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [fileSize, setFileSize] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const MAX = 120;

  useEffect(() => () => { 
    if (timerRef.current) clearInterval(timerRef.current); 
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Try different MIME types that browsers support
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      
      let mimeType = "";
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mimeType || "audio/webm" 
        });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setFileSize(blob.size);
        onRecordingChange(blob);
        setState("done");
        stream.getTracks().forEach((t) => t.stop());
      };

      // Request data every 1 second
      mr.start(1000);
      setState("recording");
      setElapsed(0);
      
      timerRef.current = setInterval(() => {
        setElapsed((p) => {
          const next = p + 1;
          if (next >= MAX) { 
            mr.stop(); 
            clearInterval(timerRef.current); 
            return MAX; 
          }
          return next;
        });
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      alert(
        `Could not start recording: ${err.message || "Please allow microphone access."}`
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
  };

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null); 
    setElapsed(0); 
    setIsPlaying(false); 
    setAudioProgress(0);
    setState("idle"); 
    onRecordingChange(null);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { 
      audioRef.current.pause(); 
      setIsPlaying(false); 
    } else { 
      audioRef.current.play(); 
      setIsPlaying(true); 
    }
  };

  return (
    <div className="cor-voice">
      {state === "idle" && (
        <button type="button" className="cor-voice-btn cor-voice-btn--start" onClick={startRecording}>
          <IconMic /> Record Voice
        </button>
      )}
      {state === "recording" && (
        <div className="cor-voice-recording">
          <div className="cor-voice-pulse">
            <span className="cor-pulse-dot" />
            <span className="cor-voice-timer">{fmtTime(elapsed)}</span>
            <span className="cor-voice-max">/ {fmtTime(MAX)}</span>
          </div>
          <div className="cor-voice-progress-track">
            <div className="cor-voice-progress-fill" style={{ width: `${(elapsed / MAX) * 100}%` }} />
          </div>
          <button type="button" className="cor-voice-btn cor-voice-btn--stop" onClick={stopRecording}>
            <IconStop /> Stop Recording
          </button>
        </div>
      )}
      {state === "done" && audioUrl && (
        <div className="cor-voice-player">
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={(e) => {
              const a = e.target;
              if (a.duration) setAudioProgress((a.currentTime / a.duration) * 100);
            }}
          />
          <div className="cor-voice-player-controls">
            <button type="button" className="cor-voice-play-btn" onClick={togglePlay}>
              {isPlaying ? <IconPause /> : <IconPlay />}
            </button>
            <div className="cor-voice-player-info">
              <div className="cor-voice-player-bar">
                <div className="cor-voice-player-fill" style={{ width: `${audioProgress}%` }} />
              </div>
              <div className="cor-voice-player-meta">
                <span>{fmtTime(elapsed)}</span>
                <span>{fmtSize(fileSize)}</span>
              </div>
            </div>
          </div>
          <div className="cor-voice-actions">
            <button type="button" className="cor-voice-action-btn" onClick={deleteRecording}>
              <IconTrash /> Delete
            </button>
            <button type="button" className="cor-voice-action-btn"
              onClick={() => { deleteRecording(); setTimeout(startRecording, 100); }}>
              <IconRefresh /> Record Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Image Uploader ── */
function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const MAX_IMAGES = 5;

  const addFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_IMAGES - images.length;
    const toAdd = valid.slice(0, remaining).map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    onChange([...images, ...toAdd]);
  };

  const remove = (i) => {
    URL.revokeObjectURL(images[i].url);
    onChange(images.filter((_, idx) => idx !== i));
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="cor-uploader">
      {images.length < MAX_IMAGES && (
        <div
          className={`cor-drop-zone${dragging ? " cor-drop-zone--active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
            multiple hidden
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="cor-drop-icon"><IconUpload /></div>
          <p className="cor-drop-text">Drag & drop images here</p>
          <p className="cor-drop-sub">or <span className="cor-drop-link">browse files</span></p>
          <p className="cor-drop-limit">{images.length}/{MAX_IMAGES} images</p>
        </div>
      )}
      {images.length > 0 && (
        <div className="cor-image-grid">
          {images.map((img, i) => (
            <div key={i} className="cor-image-thumb">
              <img src={img.url} alt={`ref ${i + 1}`} />
              <button type="button" className="cor-image-remove"
                onClick={() => remove(i)} aria-label="Remove image">
                <IconX />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function CustomizeOrder() {
  const [form, setForm] = useState({
    title: "", description: "", unit: "kg", quantity: 1, notes: "",
  });
  const [recording, setRecording] = useState(null);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const MAX_DESC = 500;

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Product title is required.";
    if (!form.description.trim() && !recording)
      e.description = "Please add a description or record your voice.";
    if (form.quantity < 1) e.quantity = "Quantity must be at least 1.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError("");

    try {
      // Build FormData — do NOT set Content-Type header manually
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("unit", form.unit);           // "kg" or "piece" — matches backend enum
      formData.append("quantity", String(form.quantity));
      if (form.notes.trim()) {
        formData.append("additionalNotes", form.notes.trim());
      }
      if (recording) {
        // fieldname must be "voice" — matches uploadFields in controller
        formData.append("voice", recording, "voice.webm");
      }
      images.forEach((img) => {
        // fieldname must be "images" — matches uploadFields in controller
        formData.append("images", img.file, img.file.name);
      });

      // Use axios directly with the correct config so Content-Type is NOT forced to JSON
      const response = await api.post("/custom-orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error submitting custom order:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to submit order. Please try again.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setForm({ title: "", description: "", unit: "kg", quantity: 1, notes: "" });
    setRecording(null);
    setImages([]);
    setErrors({});
    setServerError("");
  };

  if (success) {
    return (
      <div className="cor-page">
        <div className="cor-success-wrap">
          <div className="cor-success-card">
            <div className="cor-success-icon"><IconCheck /></div>
            <h2 className="cor-success-title">Order Submitted Successfully!</h2>
            <p className="cor-success-msg">
              Thank you. We've received your custom order request. Our team will
              review it and contact you shortly.
            </p>
            <button className="cor-success-btn" onClick={resetForm}>
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cor-page">
      <div className="cor-container">

        <div className="cor-header">
          <span className="cor-eyebrow">Special Request</span>
          <h1 className="cor-title">Customize Your Order</h1>
          <p className="cor-subtitle">
            Can't find the meat you need? Tell us exactly what you're looking
            for, and we'll do our best to arrange it for you.
          </p>
        </div>

        <form className="cor-form" onSubmit={handleSubmit} noValidate>

          {/* Server-level error banner */}
          {serverError && (
            <div className="cor-server-error">
              <strong>Error:</strong> {serverError}
            </div>
          )}

          {/* 1. Product Title */}
          <div className={`cor-field${errors.title ? " cor-field--error" : ""}`}>
            <label className="cor-label" htmlFor="cor-title">
              Product Title <span className="cor-required">*</span>
            </label>
            <input
              id="cor-title"
              className="cor-input"
              type="text"
              placeholder="e.g. Siri, Paye, Maghz, Kaleji, Special Cut, etc."
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
            {errors.title && <p className="cor-error-msg">{errors.title}</p>}
          </div>

          {/* 2. Description */}
          <div className={`cor-field${errors.description ? " cor-field--error" : ""}`}>
            <label className="cor-label" htmlFor="cor-desc">
              Description <span className="cor-required">*</span>
              <span className="cor-label-note">(or record voice below)</span>
            </label>
            <textarea
              id="cor-desc"
              className="cor-input cor-textarea"
              placeholder="Describe your requirement in detail. Mention the type of meat, preferred cut, size, freshness requirements, or anything else that helps us understand your order."
              value={form.description}
              maxLength={MAX_DESC}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
            />
            <div className="cor-char-row">
              {errors.description && (
                <p className="cor-error-msg cor-error-inline">{errors.description}</p>
              )}
              <span className={`cor-char-count${form.description.length >= MAX_DESC * 0.9 ? " cor-char-count--warn" : ""}`}>
                {form.description.length}/{MAX_DESC}
              </span>
            </div>
          </div>

          {/* 3. Voice */}
          <div className="cor-field">
            <label className="cor-label">
              Voice Description <span className="cor-optional">Optional</span>
            </label>
            <p className="cor-field-hint">
              Prefer speaking instead of typing? Record your requirement and we'll review it.
            </p>
            <VoiceRecorder onRecordingChange={(blob) => {
              setRecording(blob);
              if (blob && errors.description) setErrors((e) => ({ ...e, description: "" }));
            }} />
          </div>

          {/* 4 & 5. Unit + Quantity */}
          <div className="cor-field-row">
            <div className="cor-field">
              <label className="cor-label">Unit</label>
              <div className="cor-segment">
                {["kg", "piece"].map((u) => (
                  <button
                    key={u} type="button"
                    className={`cor-segment-btn${form.unit === u ? " cor-segment-btn--active" : ""}`}
                    onClick={() => set("unit", u)}
                  >
                    {u === "kg" ? "Kg" : "Piece"}
                  </button>
                ))}
              </div>
            </div>

            <div className="cor-field">
              <label className="cor-label">Quantity</label>
              <div className="cor-qty-wrap">
                <button
                  type="button" className="cor-qty-btn"
                  onClick={() => set("quantity", Math.max(1, form.quantity - 1))}
                  aria-label="Decrease quantity"
                >−</button>
                <span className="cor-qty-val">{form.quantity}</span>
                <button
                  type="button" className="cor-qty-btn"
                  onClick={() => set("quantity", form.quantity + 1)}
                  aria-label="Increase quantity"
                >+</button>
              </div>
              {errors.quantity && <p className="cor-error-msg">{errors.quantity}</p>}
            </div>
          </div>

          {/* 6. Images */}
          <div className="cor-field">
            <label className="cor-label">
              Reference Images <span className="cor-optional">Optional</span>
            </label>
            <p className="cor-field-hint">
              Upload reference images if you want a specific cut or product.
            </p>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* 7. Notes */}
          <div className="cor-field">
            <label className="cor-label" htmlFor="cor-notes">
              Additional Notes <span className="cor-optional">Optional</span>
            </label>
            <textarea
              id="cor-notes"
              className="cor-input cor-textarea cor-textarea--sm"
              placeholder="Any additional instructions..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="cor-submit-wrap">
            <button
              type="submit"
              className={`cor-submit-btn${submitting ? " cor-submit-btn--loading" : ""}`}
              disabled={submitting}
            >
              {submitting ? (
                <><span className="cor-spinner" />Submitting Order...</>
              ) : (
                <><IconSend />Submit Custom Order</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}