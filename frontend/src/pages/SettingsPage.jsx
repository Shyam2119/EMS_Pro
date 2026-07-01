import { useEffect, useState } from 'react'
import { schedulerAPI } from '../api/services'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import Toggle from '../components/Toggle'
import toast from 'react-hot-toast'
import { MdSchedule, MdDarkMode, MdLightMode, MdPlayArrow, MdRefresh } from 'react-icons/md'

const CRON_LABELS = {
  '0 0 22 * * *': 'Daily at 10:00 PM',
  '0 0 0 * * *':  'Daily at midnight',
  '0 0 1 1 * *':  '1st of every month at 1:00 AM',
  '0 0 18 * * *': 'Daily at 6:00 PM',
}

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme()
  const { isAdmin } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(null)

  const loadJobs = () => {
    if (!isAdmin()) { setLoading(false); return }
    setLoading(true)
    schedulerAPI.getJobs()
      .then(r => setJobs(r.data))
      .catch(() => toast.error('Failed to load scheduler jobs'))
      .finally(() => setLoading(false))
  }

  useEffect(loadJobs, [])

  const handleToggle = async (job) => {
    try {
      const { data } = await schedulerAPI.toggleJob(job.jobKey, !job.enabled)
      setJobs(j => j.map(x => x.jobKey === data.jobKey ? data : x))
      toast.success(`"${job.name}" ${data.enabled ? 'enabled' : 'disabled'}`)
    } catch {
      toast.error('Failed to toggle job')
    }
  }

  const handleRun = async (jobKey) => {
    setRunning(jobKey)
    try {
      const { data } = await schedulerAPI.runJob(jobKey)
      setJobs(j => j.map(x => x.jobKey === data.jobKey ? data : x))
      toast.success(data.lastRunResult || 'Job completed')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Job failed')
    } finally {
      setRunning(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings <span>& Preferences</span></h1>
          <p className="page-subtitle">Customize your workspace and manage automated jobs</p>
        </div>
      </div>

      {/* Appearance */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Appearance</span>
        </div>
        <div className="settings-row">
          <div className="settings-info">
            <div className="settings-icon">{isDark ? <MdDarkMode /> : <MdLightMode />}</div>
            <div>
              <div className="settings-label">Dark Mode</div>
              <div className="settings-desc">Switch between dark and light themes</div>
            </div>
          </div>
          <Toggle
            id="theme-toggle"
            checked={isDark}
            onChange={() => toggleTheme()}
          />
        </div>
      </div>

      {/* Scheduler — Admin only */}
      {isAdmin() && (
        <div className="card">
          <div className="card-header">
            <span className="card-title"><MdSchedule style={{ marginRight: 8, verticalAlign: 'middle' }} />Scheduled Jobs</span>
            <button className="btn btn-secondary btn-sm" onClick={loadJobs}><MdRefresh /> Refresh</button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
            Automated background tasks. Toggle jobs on/off or run them manually.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="loader" /></div>
          ) : (
            <div className="scheduler-list">
              {jobs.map(job => (
                <div key={job.id} className="scheduler-item">
                  <div className="scheduler-item-main">
                    <div className="scheduler-item-header">
                      <span className="scheduler-name">{job.name}</span>
                      <span className={`badge ${job.enabled ? 'badge-approved' : 'badge-inactive'}`}>
                        {job.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="scheduler-desc">{job.description}</p>
                    <div className="scheduler-meta">
                      <span>Schedule: {CRON_LABELS[job.cronExpression] || job.cronExpression}</span>
                      {job.lastRunAt && (
                        <span>Last run: {new Date(job.lastRunAt).toLocaleString()}</span>
                      )}
                    </div>
                    {job.lastRunResult && (
                      <div className="scheduler-result">{job.lastRunResult}</div>
                    )}
                  </div>
                  <div className="scheduler-item-actions">
                    <Toggle
                      id={`job-toggle-${job.jobKey}`}
                      checked={job.enabled}
                      onChange={() => handleToggle(job)}
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={running === job.jobKey}
                      onClick={() => handleRun(job.jobKey)}
                      title="Run now"
                    >
                      {running === job.jobKey ? <span className="loader" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <MdPlayArrow />}
                      Run
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isAdmin() && (
        <div className="card">
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <div className="empty-icon"><MdSchedule style={{ fontSize: 48 }} /></div>
            <p>Scheduler management is available to administrators only.</p>
          </div>
        </div>
      )}
    </div>
  )
}
