import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import Sidebar       from './components/Sidebar'
import TopBar        from './components/TopBar'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import DepartmentsPage   from './pages/DepartmentsPage'
import LeavesPage    from './pages/LeavesPage'
import AttendancePage from './pages/AttendancePage'
import SalaryPage    from './pages/SalaryPage'
import PerformancePage from './pages/PerformancePage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import AuditLogsPage from './pages/AuditLogsPage'
import SettingsPage  from './pages/SettingsPage'
import { useState } from 'react'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="loader" /></div>
  return user ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <div className="page-wrapper animate-fade-in">{children}</div>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute><AppLayout><EmployeesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/departments" element={<ProtectedRoute><AppLayout><DepartmentsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/leaves" element={<ProtectedRoute><AppLayout><LeavesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AppLayout><AttendancePage /></AppLayout></ProtectedRoute>} />
      <Route path="/salary" element={<ProtectedRoute><AppLayout><SalaryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/performance" element={<ProtectedRoute><AppLayout><PerformancePage /></AppLayout></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><AppLayout><AnnouncementsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AppLayout><AuditLogsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings"   element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1d2e',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}
