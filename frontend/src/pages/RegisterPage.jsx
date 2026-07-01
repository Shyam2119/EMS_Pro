import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/services'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', employeeId: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const payload = { username: form.username, password: form.password }
      if (form.employeeId) payload.employeeId = Number(form.employeeId)
      await authAPI.register(payload)
      toast.success('Account created — please sign in')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-slide-up">
        <h1 className="login-heading">Create an account</h1>
        <p className="login-sub">Register as an employee</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              placeholder="Choose a username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employee ID (optional)</label>
            <input
              className="form-control"
              placeholder="Link to existing employee (numeric id)"
              value={form.employeeId}
              onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
            />
            <small style={{ color: 'var(--text-muted)' }}>If you already have an employee record, provide its ID to associate your account.</small>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Choose a password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  )
}
