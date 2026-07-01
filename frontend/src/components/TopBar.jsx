import { useState, useEffect, useRef } from 'react'
import { MdMenu, MdSearch, MdNotifications, MdLogout, MdDarkMode, MdLightMode } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { announcementAPI } from '../api/services'

export default function TopBar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showNotif, setShowNotif] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const notifRef = useRef(null)

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U'

  useEffect(() => {
    announcementAPI.getAll({ activeOnly: true })
      .then(r => setAnnouncements(r.data.filter(a => ['URGENT', 'HIGH'].includes(a.priority)).slice(0, 5)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/employees?search=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <button className="topbar-toggle" onClick={onToggle} id="sidebar-toggle" aria-label="Toggle sidebar">
        <MdMenu />
      </button>

      <form className="topbar-search" onSubmit={handleSearch}>
        <MdSearch className="search-icon" />
        <input
          placeholder="Search employees..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </form>

      <div className="topbar-actions">
        <button
          className="topbar-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          id="theme-toggle-btn"
        >
          {isDark ? <MdLightMode /> : <MdDarkMode />}
        </button>

        <div className="notif-wrapper" ref={notifRef}>
          <button
            className="topbar-btn"
            id="notifications-btn"
            onClick={() => setShowNotif(v => !v)}
            title="Notifications"
          >
            <MdNotifications />
            {announcements.length > 0 && <span className="badge" />}
          </button>
          {showNotif && (
            <div className="notif-dropdown animate-slide-up">
              <div className="notif-header">Notifications</div>
              {announcements.length === 0 ? (
                <div className="notif-empty">No urgent announcements</div>
              ) : announcements.map(a => (
                <div key={a.id} className="notif-item" onClick={() => { setShowNotif(false); navigate('/announcements') }}>
                  <span className={`badge ${a.priority === 'URGENT' ? 'badge-rejected' : 'badge-pending'}`}>{a.priority}</span>
                  <span className="notif-title">{a.title}</span>
                </div>
              ))}
              <button className="notif-view-all" onClick={() => { setShowNotif(false); navigate('/announcements') }}>
                View all announcements →
              </button>
            </div>
          )}
        </div>

        <button className="topbar-btn" onClick={handleLogout} title="Logout" id="logout-btn">
          <MdLogout />
        </button>

        <div className="user-avatar" title={`${user?.firstName} (${user?.role})`}>
          {initials}
        </div>
      </div>
    </header>
  )
}
