import React, { useState } from 'react';
import AcademicOverviewModule from './AcademicOverviewModule';
import Internal1Module from './Internal1Module';
import Internal2Module from './Internal2Module';
import AssignmentMarksModule from './AssignmentMarksModule';
import SemesterMarksModule from './SemesterMarksModule';
import SgpaCgpaModule from './SgpaCgpaModule';
import ArrearsModule from './ArrearsModule';

export default function AcademicModuleContainer({ student, initialSubTab = 'overview', onSaveSuccess }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);

  const academicMenu = [
    { id: 'overview', title: 'Academic Overview', icon: '📊', color: '#F4B400' },
    { id: 'internal-1', title: 'Internal Marks 1', icon: '📘', color: '#3B82F6' },
    { id: 'internal-2', title: 'Internal Marks 2', icon: '📗', color: '#10B981' },
    { id: 'assignments', title: 'Assignment Marks', icon: '📙', color: '#F59E0B' },
    { id: 'semester-marks', title: 'Semester Marks', icon: '📊', color: '#EF4444' },
    { id: 'sgpa-cgpa', title: 'SGPA / CGPA', icon: '🎓', color: '#818CF8' },
    { id: 'arrears', title: 'Arrears', icon: '⚠️', color: '#F87171' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ACADEMIC NAVIGATION BAR (7 SUB-MODULE PAGES) */}
      <div style={{
        display: 'flex', gap: 8, background: 'linear-gradient(135deg, #5A0A0A 0%, #4B0909 100%)', padding: '10px 14px', borderRadius: 12,
        border: '1.5px solid #D69A18', overflowX: 'auto', boxShadow: '0 4px 14px rgba(90, 10, 10, 0.25)'
      }}>
        {academicMenu.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: isActive ? '1.5px solid #D69A18' : '1px solid rgba(214, 154, 24, 0.25)',
                background: isActive ? '#720F0F' : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#FFFFFF' : '#F9EED4',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              <span>{item.icon}</span>
              <span style={{ color: isActive ? '#FFFFFF' : '#F9EED4' }}>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER THE SELECTED COMPLETELY SEPARATE MARK PAGE */}
      {activeTab === 'overview' && (
        <AcademicOverviewModule
          student={student}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'internal-1' && (
        <Internal1Module
          student={student}
          onSaveSuccess={onSaveSuccess}
          onNavigateNext={setActiveTab}
        />
      )}

      {activeTab === 'internal-2' && (
        <Internal2Module
          student={student}
          onSaveSuccess={onSaveSuccess}
          onNavigateNext={setActiveTab}
        />
      )}

      {activeTab === 'assignments' && (
        <AssignmentMarksModule
          student={student}
          onSaveSuccess={onSaveSuccess}
          onNavigateNext={setActiveTab}
        />
      )}

      {activeTab === 'semester-marks' && (
        <SemesterMarksModule
          student={student}
          onSaveSuccess={onSaveSuccess}
          onNavigateNext={setActiveTab}
        />
      )}

      {activeTab === 'sgpa-cgpa' && (
        <SgpaCgpaModule
          student={student}
        />
      )}

      {activeTab === 'arrears' && (
        <ArrearsModule
          student={student}
        />
      )}
    </div>
  );
}
