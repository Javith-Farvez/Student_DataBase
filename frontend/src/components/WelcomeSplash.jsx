import React, { useEffect, useState } from 'react';
import VSBLogo from './VSBLogo.jsx';

export default function WelcomeSplash({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('Initializing VSB EduCore System...');

  useEffect(() => {
    const steps = [
      { pct: 25, label: 'Connecting to V.S.B Enterprise System...' },
      { pct: 55, label: 'Loading Student Information Systems...' },
      { pct: 85, label: 'Verifying Security & Role Protocols...' },
      { pct: 100, label: 'VSB Engineering College ERP Ready!' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].pct);
        setLoadingStep(steps[currentStep].label);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#E5E0D7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        color: '#252525',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Background Decorative Accent Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #6E0F0F, #D49A17, #4B0808)'
        }}
      />

      {/* Main Center Card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 580,
        width: '100%',
        background: '#F1EDE5',
        border: '1px solid #C9C0B2',
        borderRadius: 16,
        padding: '40px 32px',
        boxShadow: '0 8px 30px rgba(110, 15, 15, 0.06)'
      }}>
        
        {/* Crest Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 24
        }}>
          <VSBLogo size={80} showTitle={false} />
        </div>

        {/* Title & Subtitle */}
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          color: '#6E0F0F',
          letterSpacing: '-0.01em',
          margin: '0 0 8px 0',
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          V.S.B. ENGINEERING COLLEGE
        </h1>

        <p style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#D49A17',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 6
        }}>
          VSB Enterprise Campus ERP
        </p>

        <p style={{
          fontSize: '0.88rem',
          color: '#666666',
          maxWidth: 460,
          margin: '0 auto 30px auto'
        }}>
          Centralized Student Information System & Academic Platform
        </p>

        {/* Loading Progress Bar */}
        <div style={{ width: '100%', maxWidth: 420, margin: '0 auto 14px auto' }}>
          <div style={{
            height: 8,
            width: '100%',
            background: '#E5E0D7',
            borderRadius: 9999,
            overflow: 'hidden',
            border: '1px solid #C9C0B2',
            padding: 1
          }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6E0F0F, #D49A17)',
                borderRadius: 9999,
                transition: 'width 0.4s ease-in-out'
              }}
            />
          </div>
        </div>

        {/* Step Label */}
        <p style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          color: '#6E0F0F',
          fontFamily: "'Inter', sans-serif"
        }}>
          {loadingStep} ({progress}%)
        </p>

        {/* Motto Ribbon Badge */}
        <div style={{
          marginTop: 32,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          borderRadius: 9999,
          background: '#F5E8CC',
          border: '1px solid #D49A17',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#6E0F0F'
        }}>
          <span>KARUR - 639 111</span>
          <span>•</span>
          <span>HARDWORK IS THE KEY TO SUCCESS</span>
        </div>

      </div>
    </div>
  );
}

