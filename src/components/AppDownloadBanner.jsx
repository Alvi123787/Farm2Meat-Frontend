import React, { useState, useEffect, useRef } from 'react';

const AppDownloadBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const AUTO_DISMISS_TIME = 4000; // 4 seconds
  const STORAGE_KEY = 'meatbyalvi_app_banner_dismissed';

  useEffect(() => {
    const hasDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!hasDismissed) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / AUTO_DISMISS_TIME) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          handleDismiss(false);
        }
      }, 50);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isVisible]);

  const handleDismiss = (permanent = true) => {
    setIsVisible(false);
    if (permanent) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  const handleDownload = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    // Link to app store or download page (customize this URL!)
    window.open('https://meatbyalvi.com/download', '_blank');
  };

  if (!isVisible) return null;

  return (
    <div
      className="app-download-banner"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #8B4513 0%, #5D2E0C 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px'
          }}>
            📱
          </div>
          <div style={{ color: 'white' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, letterSpacing: '0.2px' }}>
              Get the MeatByAlvi App
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
              Order fresh meat on the go with our mobile app
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleDownload}
            style={{
              background: 'white',
              color: '#8B4513',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            Download Now
          </button>
          <button
            onClick={() => handleDismiss(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
              transition: 'color 0.2s',
              lineHeight: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'rgba(255,255,255,0.8)';
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'rgba(255,255,255,0.2)'
      }}>
        <div style={{
          height: '100%',
          background: 'rgba(255,255,255,0.7)',
          width: `${progress}%`,
          transition: 'width 0.05s linear'
        }} />
      </div>
    </div>
  );
};

export default AppDownloadBanner;
