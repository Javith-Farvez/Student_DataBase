import React from 'react';
import VSBStudentProfile from './VSBStudentProfile.jsx';

export default function StudentProfileView({ student, allStudents, onSelectStudent, onBack, userRole, userSession }) {
  return (
    <VSBStudentProfile
      student={student}
      userSession={userSession || { role: userRole || 'ADMIN' }}
      allStudents={allStudents}
      onSelectStudent={onSelectStudent}
      onBack={onBack}
      readOnly={userRole === 'HOD_VIEW_ONLY'}
    />
  );
}
