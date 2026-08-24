import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import StudentListPage from '@/pages/StudentListPage'
import StudentDetailPage from '@/pages/StudentDetailPage'
import StudentFormPage from '@/pages/StudentFormPage'
import SslcHscListPage from '@/pages/SslcHscListPage'
import StudentAcademicProfilePage from '@/pages/StudentAcademicProfilePage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/students" replace />} />
        <Route path="/students" element={<StudentListPage />} />
        <Route path="/students/new" element={<StudentFormPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/students/:id/edit" element={<StudentFormPage />} />
        <Route path="/students/:studentId/academic" element={<StudentAcademicProfilePage />} />
        <Route path="/academic/sslc-hsc" element={<SslcHscListPage />} />
      </Routes>
    </Layout>
  )
}
