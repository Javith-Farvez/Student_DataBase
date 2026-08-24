import React, { useState, useEffect, Component } from 'react';
import VSBLogo from './components/VSBLogo.jsx';
import WelcomeSplash from './components/WelcomeSplash.jsx';
import LandingPage from './components/LandingPage.jsx';
import LoginPortal from './components/LoginPortal.jsx';
import RoleWorkspace from './components/RoleWorkspace.jsx';
import VSBDepartmentDetail from './components/VSBDepartmentDetail.jsx';

const API_BASE = 'http://127.0.0.1:8000/api/v1';


// React Error Boundary with detailed diagnostics
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("VSB App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errStr = this.state.error
        ? (typeof this.state.error === 'object' ? (this.state.error.message || JSON.stringify(this.state.error)) : String(this.state.error))
        : 'Unknown Component Render Error';

      return (
        <div style={{
          minHeight: '100vh',
          background: '#EDE7DC',
          color: '#2B2926',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 30,
          textAlign: 'center'
        }}>
          <VSBLogo size={70} showTitle={true} lightTheme={true} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '20px 0 10px', color: '#720F0F', fontFamily: 'var(--font-college)' }}>
            VSB SmartCampus Session Diagnostic
          </h2>
          <p style={{ color: '#5C5750', maxWidth: 600, marginBottom: 16, fontSize: '0.95rem' }}>
            An unexpected render issue occurred:
          </p>
          <div style={{
            background: '#FDF2F2',
            border: '1.5px solid #A52A24',
            color: '#A52A24',
            padding: '12px 20px',
            borderRadius: 8,
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            marginBottom: 24,
            maxWidth: 650,
            wordBreak: 'break-all'
          }}>
            {errStr}
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
          >
            🔄 Reset to Landing Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [showSplash, setShowSplash] = useState(false);
  // Default to 'landing' so that the first page shown is the Landing Page
  const [currentView, setCurrentView] = useState('landing');
  const [loginInitialRole, setLoginInitialRole] = useState('STAFF');
  
  // Data state
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [currentUser, setCurrentUser] = useState({
    token: 'demo-jwt-token-2026',
    employeeId: 'STAFF_AIDS_001',
    userName: 'Prof. M. Rajesh (Faculty AI&DS)',
    role: 'STAFF',
    department: { id: 'dept-aids', code: 'AIDS', name: 'Artificial Intelligence and Data Science' }
  });

  // Selected Entities
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const fetchData = async () => {
    try {
      const healthRes = await fetch('http://127.0.0.1:8000/health');
      if (healthRes.ok) {
        setBackendStatus('connected');
      }
      const deptsRes = await fetch(`${API_BASE}/departments/`);
      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        setDepartments(deptsData);
      }
      const studentsRes = await fetch(`${API_BASE}/students/`);
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }
    } catch (e) {
      console.warn("Backend fetch error:", e);
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoginSuccess = (userSession) => {
    const sessionToSet = userSession || {
      token: 'demo-jwt-token-2026',
      employeeId: 'STAFF_AIDS_001',
      userName: 'Prof. M. Rajesh (Faculty AI&DS)',
      role: 'STAFF',
      department: { id: 'dept-aids', code: 'AIDS', name: 'Artificial Intelligence and Data Science' }
    };
    setCurrentUser(sessionToSet);
    // Proceed directly to Step 3: Custom Role Workspace based on who logged in!
    setCurrentView('role-workspace');
  };

  const handleSelectDeptFromLanding = (dept) => {
    if (dept) {
      setSelectedDept(dept);
      setCurrentView('dept-detail');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const activeSession = currentUser || {
    token: 'demo-jwt-token-2026',
    employeeId: 'STAFF_AIDS_001',
    userName: 'Prof. M. Rajesh (Faculty AI&DS)',
    role: 'STAFF',
    department: { id: 'dept-aids', code: 'AIDS', name: 'Artificial Intelligence and Data Science' }
  };

  return (
    <div>
      {/* INITIAL WELCOME SPLASH & LOADING SCREEN */}
      {showSplash && (
        <WelcomeSplash onComplete={() => setShowSplash(false)} />
      )}

      {/* STEP 1: PUBLIC LANDING PAGE FIRST */}
      {(currentView === 'landing' || currentView === 'login') && (
        <LandingPage
          departments={departments}
          onOpenLogin={() => setCurrentView('login')}
          onSelectDept={handleSelectDeptFromLanding}
        />
      )}

      {/* STEP 2: AUTHORIZED STAFF LOGIN MODAL */}
      {currentView === 'login' && (
        <LoginPortal
          departments={departments}
          onClose={() => setCurrentView('landing')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* STEP 3: ROLE WORKSPACE THIRD */}
      {currentView === 'role-workspace' && (
        <RoleWorkspace
          userSession={activeSession}
          departments={departments}
          students={students}
          onSignOut={() => {
            setCurrentUser(null);
            setCurrentView('landing');
          }}
        />
      )}

      {/* DEDICATED DEPARTMENT DETAIL PAGE INSIDE ERP */}
      {currentView === 'dept-detail' && selectedDept && (
        <VSBDepartmentDetail
          department={selectedDept}
          userSession={activeSession}
          onBack={() => setCurrentView('landing')}
          onNavigateToRoster={() => setCurrentView('login')}
        />
      )}

      {/* CATCH-ALL ROUTE PREVENTING BLANK CANVAS */}
      {currentView !== 'landing' &&
       currentView !== 'login' &&
       currentView !== 'role-workspace' &&
       currentView !== 'dept-detail' && (
        <LandingPage
          departments={departments}
          onOpenLogin={() => setCurrentView('login')}
          onSelectDept={handleSelectDeptFromLanding}
        />
      )}


    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
