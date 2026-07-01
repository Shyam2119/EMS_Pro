import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MdDashboard, MdPeople, MdBusiness, MdEventNote, MdAccessTime,
  MdPayments, MdStar, MdCampaign, MdHistory, MdLogout, MdSettings
} from 'react-icons/md'

const NAV_ITEMS = [
  { label: 'Dashboard',     icon: <MdDashboard />,  to: '/' },
  { label: 'Employees',     icon: <MdPeople />,     to: '/employees' },
  { label: 'Departments',   icon: <MdBusiness />,   to: '/departments' },
  { label: 'Leave Requests',icon: <MdEventNote />,  to: '/leaves' },
  { label: 'Attendance',    icon: <MdAccessTime />, to: '/attendance' },
  { label: 'Salary',        icon: <MdPayments />,   to: '/salary' },
  { label: 'Performance',   icon: <MdStar />,       to: '/performance' },
  { label: 'Announcements', icon: <MdCampaign />,   to: '/announcements' },
  { label: 'Settings',      icon: <MdSettings />,   to: '/settings' },
  { label: 'Audit Logs',    icon: <MdHistory />,    to: '/audit-logs', adminOnly: true },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filtered = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin())

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">E</div>
        {!collapsed && (
          <div className="logo-text">EMS <span>Pro</span></div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-title">Main Menu</div>}
        {filtered.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && user && (
          <div style={{ padding: '8px 10px 14px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{user.role}</div>
          </div>
        )}
        <button
          className="nav-item"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          style={{ width: '100%', color: 'var(--accent-danger)' }}
        >
          <span className="nav-icon"><MdLogout /></span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
