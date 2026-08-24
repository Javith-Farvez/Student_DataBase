import React, { useState } from 'react';
import VSBLogo from './VSBLogo.jsx';

// Official 11 UG Departments fallback list if backend loading is pending
const OFFICIAL_11_DEPARTMENTS = [
  { code: 'IT', name: 'Information Technology', icon: '💻', students: 180, faculty: 22 },
  { code: 'CSE', name: 'Computer Science and Engineering', icon: '⚡', students: 240, faculty: 28 },
  { code: 'AI & DS', name: 'Artificial Intelligence and Data Science', icon: '📊', students: 180, faculty: 20 },
  { code: 'AI & ML', name: 'Artificial Intelligence and Machine Learning', icon: '🧠', students: 120, faculty: 16 },
  { code: 'CSBS', name: 'Computer Science and Business System', icon: '💾', students: 120, faculty: 15 },
  { code: 'CCE', name: 'Computer and Communication Engineering', icon: '📡', students: 120, faculty: 15 },
  { code: 'ECE', name: 'Electronics and Communication Engineering', icon: '🔌', students: 240, faculty: 26 },
  { code: 'EEE', name: 'Electrical and Electronics Engineering', icon: '⚡', students: 180, faculty: 20 },
  { code: 'MECH', name: 'Mechanical Engineering', icon: '⚙️', students: 180, faculty: 22 },
  { code: 'CHEM', name: 'Chemical Engineering', icon: '🧪', students: 120, faculty: 14 },
  { code: 'CIVIL', name: 'Civil Engineering', icon: '🏗️', students: 120, faculty: 14 }
];

export default function LandingPage({ departments = [], onOpenLogin, onSelectDept }) {
  // Merge backend departments with official list to ensure all 11 are displayed with fallback counts
  const displayDepartments = OFFICIAL_11_DEPARTMENTS.map(official => {
    const matched = departments.find(d => 
      (d.code && d.code.replace('&', '').replace(/ /g, '') === official.code.replace('&', '').replace(/ /g, '')) ||
      (d.code === 'AIDS' && official.code === 'AI & DS') ||
      (d.code === 'AIML' && official.code === 'AI & ML')
    );
    return {
      id: matched ? matched.id : `dept-${official.code.toLowerCase().replace(/[^a-z]/g, '')}`,
      code: official.code,
      name: official.name,
      icon: official.icon,
      student_count: matched?.student_count || official.students,
      faculty_count: matched?.faculty_count || official.faculty,
      rawDept: matched || official
    };
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#DED9D0',
      color: '#242424',
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden'
    }}>
      
      {/* 1. HEADER / NAVBAR */}
      <header style={{
        background: '#F1EDE5',
        borderBottom: '1px solid #C9C0B2',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          height: 85,
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Left Branding */}
          <div 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <VSBLogo size={46} showTitle={true} subtitle="KARUR – 639 111" lightTheme={false} />
          </div>

          {/* Center Navigation Links */}
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <a
              href="#home"
              style={{
                color: '#6E0F0F',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                borderBottom: '2px solid #D49A17',
                paddingBottom: 4
              }}
            >
              HOME
            </a>
            <a
              href="#departments"
              style={{
                color: '#444444',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                transition: 'color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#6E0F0F'}
              onMouseOut={e => e.currentTarget.style.color = '#444444'}
            >
              DEPARTMENTS
            </a>
            <a
              href="#about"
              style={{
                color: '#444444',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                transition: 'color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#6E0F0F'}
              onMouseOut={e => e.currentTarget.style.color = '#444444'}
            >
              ABOUT
            </a>
            <a
              href="#features"
              style={{
                color: '#444444',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                transition: 'color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#6E0F0F'}
              onMouseOut={e => e.currentTarget.style.color = '#444444'}
            >
              ERP FEATURES
            </a>
            <a
              href="#contact"
              style={{
                color: '#444444',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                transition: 'color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = '#6E0F0F'}
              onMouseOut={e => e.currentTarget.style.color = '#444444'}
            >
              CONTACT
            </a>
          </nav>

          {/* Right Login Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={onOpenLogin}
              style={{
                padding: '10px 22px',
                fontSize: '0.84rem',
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                background: '#6E0F0F',
                color: '#FFFFFF',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#4B0808';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(110, 15, 15, 0.25)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#6E0F0F';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              LOGIN TO ERP
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION - CAMPUS IMAGE LEFT (52%), TEXT RIGHT (48%) */}
      <section id="home" style={{
        background: '#DED9D0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '52% 48%',
          alignItems: 'center',
          minHeight: '480px'
        }}>
          
          {/* LEFT 52%: Actual VSB Engineering College Campus Image */}
          <div style={{
            position: 'relative',
            height: '100%',
            minHeight: '440px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <img
              src="/vsb-campus.jpg"
              alt="V.S.B. Engineering College Building"
              style={{
                width: '100%',
                height: '460px',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block'
              }}
            />
            {/* Subtle right-side white gradient fade into hero text area */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '120px',
              background: 'linear-gradient(to right, rgba(222,217,208,0) 0%, #DED9D0 100%)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* RIGHT 48%: Hero Text (Left Aligned) */}
          <div style={{
            padding: '40px 24px 40px 48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h1 style={{
              fontSize: '2.8rem',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#6E0F0F',
              marginBottom: 14,
              letterSpacing: '-0.01em'
            }}>
              V.S.B. ENGINEERING COLLEGE
            </h1>

            <h2 style={{
              fontSize: '1.25rem',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: '#252525',
              lineHeight: 1.35,
              marginBottom: 16
            }}>
              Empowering Minds. Engineering the Future.
            </h2>

            <div style={{
              width: 50,
              height: 3,
              background: '#D49A17',
              borderRadius: 2,
              marginBottom: 18
            }} />

            <p style={{
              fontSize: '0.98rem',
              color: '#666666',
              lineHeight: 1.65,
              marginBottom: 32,
              maxWidth: 520
            }}>
              A premier institution committed to academic excellence, innovation and holistic development.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={onOpenLogin}
                style={{
                  padding: '13px 28px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  background: '#6E0F0F',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#4B0808'}
                onMouseOut={e => e.currentTarget.style.background = '#6E0F0F'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                LOGIN TO ERP
              </button>

              <a
                href="#departments"
                style={{
                  padding: '13px 26px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  textDecoration: 'none',
                  color: '#252525',
                  background: '#F1EDE5',
                  border: '1.5px solid #6E0F0F',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = '#D49A17';
                  e.currentTarget.style.color = '#6E0F0F';
                  e.currentTarget.style.background = '#EAE5DC';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = '#6E0F0F';
                  e.currentTarget.style.color = '#242424';
                  e.currentTarget.style.background = '#F1EDE5';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                VIEW 11 UG DEPARTMENTS
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 3. HIGHLIGHT SECTION (INSTITUTIONAL STRIP) */}
      <section id="about" style={{
        background: '#E5E0D7',
        borderTop: '1px solid #C9C0B2',
        borderBottom: '1px solid #C9C0B2',
        padding: '28px 32px',
        margin: '20px 0 50px'
      }}>
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 32
        }}>
          {/* Pillar 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#F5E8CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6E0F0F',
              flexShrink: 0
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#252525', marginBottom: 3 }}>Academic Excellence</h4>
              <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.4 }}>Quality education and industry oriented programs</p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#F5E8CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6E0F0F',
              flexShrink: 0
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#252525', marginBottom: 3 }}>Experienced Faculty</h4>
              <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.4 }}>Learn from dedicated and experienced professionals</p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#F5E8CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6E0F0F',
              flexShrink: 0
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#252525', marginBottom: 3 }}>Modern Infrastructure</h4>
              <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.4 }}>Advanced labs, library and state-of-the-art facilities</p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#F5E8CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6E0F0F',
              flexShrink: 0
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#252525', marginBottom: 3 }}>Holistic Development</h4>
              <p style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.4 }}>Focus on overall development and placements</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR DEPARTMENTS SECTION */}
      <section id="departments" style={{
        maxWidth: 1320,
        margin: '50px auto 70px',
        padding: '0 32px'
      }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 40,
            height: 3,
            background: '#D49A17',
            margin: '0 auto 12px',
            borderRadius: 2
          }} />
          <h2 style={{
            fontSize: '2.1rem',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800,
            color: '#6E0F0F',
            letterSpacing: '0.02em'
          }}>
            OUR DEPARTMENTS
          </h2>
          <p style={{ color: '#666666', marginTop: 6, fontSize: '0.94rem' }}>
            Explore all 11 Undergraduate Engineering & Technology Departments
          </p>
        </div>

        {/* 4-Column Grid Desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24
        }}>
          {displayDepartments.map(dept => (
            <div
              key={dept.code}
              style={{
                background: '#F1EDE5',
                border: '1px solid #C9C0B2',
                borderRadius: '8px',
                padding: '20px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'all 220ms ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                cursor: 'pointer'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#D49A17';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(110, 15, 15, 0.08)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#E8E1D7';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => onSelectDept ? onSelectDept(dept.rawDept) : onOpenLogin()}
            >
              {/* Light Gold Circular Icon Container */}
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '10px',
                background: '#F5E8CC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                flexShrink: 0
              }}>
                {dept.icon}
              </div>

              {/* Department Name & Code */}
              <div style={{ flexGrow: 1 }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 800,
                  color: '#6E0F0F',
                  marginBottom: 2
                }}>
                  {dept.code}
                </h3>

                <p style={{
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: '#666666',
                  lineHeight: 1.35,
                  marginBottom: 6
                }}>
                  {dept.name}
                </p>

                <div style={{
                  fontSize: '0.78rem',
                  color: '#D49A17',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  View Department →
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. COLLEGE ERP FEATURES SECTION */}
      <section id="features" style={{
        background: '#F1EDE5',
        padding: '60px 32px 70px',
        borderTop: '1px solid #C9C0B2'
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{
              width: 40,
              height: 3,
              background: '#D49A17',
              margin: '0 auto 12px',
              borderRadius: 2
            }} />
            <h2 style={{
              fontSize: '2rem',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 800,
              color: '#6E0F0F'
            }}>
              COLLEGE ERP FEATURES
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28
          }}>
            {/* Feature 1 */}
            <div style={{
              background: '#F1EDE5',
              padding: '24px 22px',
              borderRadius: '8px',
              border: '1px solid #C9C0B2',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                background: '#F5E8CC',
                color: '#6E0F0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>Student Management</h3>
                <p style={{ fontSize: '0.84rem', color: '#666666', lineHeight: 1.5 }}>
                  Complete student records from admission to graduation.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div style={{
              background: '#F1EDE5',
              padding: '24px 22px',
              borderRadius: '8px',
              border: '1px solid #C9C0B2',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                background: '#F5E8CC',
                color: '#6E0F0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>Academics</h3>
                <p style={{ fontSize: '0.84rem', color: '#666666', lineHeight: 1.5 }}>
                  Internal & External marks, assignments and SGPA/CGPA.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div style={{
              background: '#F1EDE5',
              padding: '24px 22px',
              borderRadius: '8px',
              border: '1px solid #C9C0B2',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                background: '#F5E8CC',
                color: '#6E0F0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>Attendance</h3>
                <p style={{ fontSize: '0.84rem', color: '#666666', lineHeight: 1.5 }}>
                  Daily, subject-wise and semester attendance.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div style={{
              background: '#F1EDE5',
              padding: '24px 22px',
              borderRadius: '8px',
              border: '1px solid #C9C0B2',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                background: '#F5E8CC',
                color: '#6E0F0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>Examinations</h3>
                <p style={{ fontSize: '0.84rem', color: '#666666', lineHeight: 1.5 }}>
                  Internal and external examination records.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div style={{
              background: '#F1EDE5',
              padding: '24px 22px',
              borderRadius: '8px',
              border: '1px solid #C9C0B2',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                background: '#F5E8CC',
                color: '#6E0F0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>Fees Management</h3>
                <p style={{ fontSize: '0.84rem', color: '#666666', lineHeight: 1.5 }}>
                  College, semester, hostel and bus fee tracking.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div style={{
              background: '#F1EDE5',
              padding: '24px 22px',
              borderRadius: '8px',
              border: '1px solid #C9C0B2',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                background: '#F5E8CC',
                color: '#6E0F0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>Document Management</h3>
                <p style={{ fontSize: '0.84rem', color: '#666666', lineHeight: 1.5 }}>
                  Secure student document storage.
                </p>
              </div>
            </div>

            {/* Feature 7 */}
            <div style={{
              background: '#F1EDE5',
              padding: '24px 22px',
              borderRadius: '8px',
              border: '1px solid #C9C0B2',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                background: '#F5E8CC',
                color: '#6E0F0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>Placement Management</h3>
                <p style={{ fontSize: '0.84rem', color: '#666666', lineHeight: 1.5 }}>
                  Student placement and assessment records.
                </p>
              </div>
            </div>

            {/* Feature 8 */}
            <div style={{
              background: '#F1EDE5',
              padding: '24px 22px',
              borderRadius: '8px',
              border: '1px solid #C9C0B2',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                background: '#F5E8CC',
                color: '#6E0F0F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>Reports</h3>
                <p style={{ fontSize: '0.84rem', color: '#666666', lineHeight: 1.5 }}>
                  Professional PDF and printable reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ERP CTA BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #4B0808 0%, #6E0F0F 100%)',
        color: '#FFFFFF',
        padding: '56px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle architectural background SVG overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '1.9rem',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800,
            marginBottom: 12,
            letterSpacing: '0.02em'
          }}>
            V.S.B. ENGINEERING COLLEGE ERP
          </h2>
          <p style={{
            fontSize: '0.98rem',
            color: '#F5E8CC',
            marginBottom: 28,
            lineHeight: 1.5
          }}>
            One secure platform for managing student academic and institutional records.
          </p>
          <button
            onClick={onOpenLogin}
            style={{
              padding: '13px 34px',
              fontSize: '0.9rem',
              fontWeight: 800,
              fontFamily: "'Inter', sans-serif",
              background: '#D49A17',
              color: '#4B0808',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#F5E8CC';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#D49A17';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            LOGIN TO ERP
          </button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer id="contact" style={{
        background: '#4B0808',
        color: '#FFFFFF',
        padding: '50px 32px 24px',
        fontSize: '0.85rem'
      }}>
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
          marginBottom: 40
        }}>
          {/* Column 1: College Info */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <VSBLogo size={48} showTitle={true} subtitle="KARUR – 639 111" lightTheme={true} />
            </div>
            <p style={{ color: '#E8E1D7', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: 20 }}>
              Empowering Minds. Engineering the Future.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="#" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>f</a>
              <a href="#" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>📷</a>
              <a href="#" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>▶</a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#D49A17',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 18
            }}>
              QUICK LINKS
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li><a href="#home" style={{ color: '#E8E1D7', textDecoration: 'none' }}>Home</a></li>
              <li><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>Departments</a></li>
              <li><a href="#about" style={{ color: '#E8E1D7', textDecoration: 'none' }}>About</a></li>
              <li><a href="#features" style={{ color: '#E8E1D7', textDecoration: 'none' }}>ERP Features</a></li>
              <li><a href="#contact" style={{ color: '#E8E1D7', textDecoration: 'none' }}>Contact</a></li>
            </ul>
          </div>

          {/* Column 3: Departments */}
          <div>
            <h4 style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#D49A17',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 18
            }}>
              DEPARTMENTS
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>IT</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>ECE</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>CSE</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>EEE</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>AI & DS</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>MECH</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>AI & ML</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>CHEM</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>CSBS</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>CIVIL</a></div>
              <div><a href="#departments" style={{ color: '#E8E1D7', textDecoration: 'none' }}>CCE</a></div>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#D49A17',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 18
            }}>
              CONTACT US
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, color: '#E8E1D7', fontSize: '0.84rem' }}>
              <li style={{ display: 'flex', gap: 8 }}>
                <span>📍</span>
                <span>NH-67, Covai Road, Karudayampalayam PO, Karur – 639 111, Tamil Nadu, India.</span>
              </li>
              <li style={{ display: 'flex', gap: 8 }}>
                <span>📞</span>
                <span>04324 - 272411</span>
              </li>
              <li style={{ display: 'flex', gap: 8 }}>
                <span>✉️</span>
                <span>office@vsbec.edu.in</span>
              </li>
              <li style={{ display: 'flex', gap: 8 }}>
                <span>🌐</span>
                <span>www.vsbec.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div style={{
          maxWidth: 1320,
          margin: '0 auto',
          borderTop: '1px solid rgba(212, 154, 23, 0.3)',
          paddingTop: 20,
          textAlign: 'center',
          color: '#E8E1D7',
          fontSize: '0.8rem'
        }}>
          © 2025 V.S.B. Engineering College. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
