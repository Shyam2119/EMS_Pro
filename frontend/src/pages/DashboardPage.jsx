import { useEffect, useState } from 'react'
import { dashboardAPI } from '../api/services'
import { MdPeople, MdBusiness, MdEventNote, MdAccessTime } from 'react-icons/md'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['#7c3aed','#0ea5e9','#10b981','#f59e0b','#ef4444','#a78bfa']

export default function DashboardPage() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-page"><div className="loader" /></div>

  const statCards = [
    { label: 'Total Employees',   value: stats?.totalEmployees  ?? 0, icon: <MdPeople />,     color: 'purple', change: '+5 this month' },
    { label: 'Departments',       value: stats?.totalDepartments ?? 0, icon: <MdBusiness />,   color: 'blue',   change: 'Active units' },
    { label: 'Pending Leaves',    value: stats?.pendingLeaves   ?? 0, icon: <MdEventNote />,   color: 'amber',  change: 'Awaiting approval' },
    { label: 'Present Today',     value: stats?.presentToday    ?? 0, icon: <MdAccessTime />,  color: 'green',  change: `of ${stats?.activeEmployees ?? 0} active` },
  ]

  const deptData = (stats?.departmentDistribution || []).map(d => ({
    name: d.name, value: Number(d.count)
  }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard <span>Overview</span></h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map(card => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-body">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-change up">↑ {card.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="chart-grid">
        {/* Pie chart - dept distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Department Distribution</span>
          </div>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                     dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                     labelLine={false}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">📊</div>
              <p>No department data yet</p>
            </div>
          )}
        </div>

        {/* Bar chart - dept headcount */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Headcount by Department</span>
          </div>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#f1f5f9' }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[4,4,0,0]} name="Employees" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">📈</div>
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
        </div>
        {stats?.recentActivities?.length > 0 ? (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Description</th>
                  <th>By</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivities.map((a, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-active">{a.action}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.description}</td>
                    <td>{a.performedBy}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(a.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🕐</div>
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
