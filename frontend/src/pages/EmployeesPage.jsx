import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { employeeAPI, departmentAPI } from '../api/services'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md'
import Toggle from '../components/Toggle'

const STATUS_OPTS  = ['ACTIVE','INACTIVE','ON_LEAVE','TERMINATED']
const ROLE_OPTS    = ['EMPLOYEE','ADMIN','MANAGER','HR']
const GENDER_OPTS  = ['MALE','FEMALE','OTHER']

function EmployeeModal({ employee, departments, onClose, onSave }) {
  const isEdit = !!employee?.id
  const [form, setForm] = useState(() => {
    const base = {
      firstName:'', lastName:'', email:'', phone:'', jobTitle:'',
      address:'', status:'ACTIVE', role:'EMPLOYEE', gender:'',
      emergencyContactName:'', emergencyContactPhone:'',
      basicSalary:'', departmentId:'',
    }
    if (!employee) return base
    return {
      ...base,
      ...employee,
      departmentId: employee.department?.id ?? '',
    }
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First name, last name and email are required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        basicSalary: form.basicSalary || null,
        department:  form.departmentId ? { id: Number(form.departmentId) } : null,
      }
      if (isEdit) await employeeAPI.update(employee.id, payload)
      else        await employeeAPI.create(payload)
      toast.success(isEdit ? 'Employee updated!' : 'Employee added!')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" value={form.firstName} onChange={e=>set('firstName',e.target.value)} placeholder="John" required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" value={form.lastName} onChange={e=>set('lastName',e.target.value)} placeholder="Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-control" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="john@company.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 9876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input className="form-control" value={form.jobTitle} onChange={e=>set('jobTitle',e.target.value)} placeholder="Software Engineer" />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-control" value={form.departmentId} onChange={e=>set('departmentId',e.target.value)}>
                  <option value="">-- No Department --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={form.role} onChange={e=>set('role',e.target.value)}>
                  {ROLE_OPTS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e=>set('status',e.target.value)}>
                  {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                  <option value="">-- Select --</option>
                  {GENDER_OPTS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Basic Salary (₹)</label>
                <input type="number" className="form-control" value={form.basicSalary} onChange={e=>set('basicSalary',e.target.value)} placeholder="50000" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Full address" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add Employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EmployeesPage() {
  const [searchParams] = useSearchParams()
  const [employees,    setEmployees]    = useState([])
  const [departments,  setDepartments]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState(searchParams.get('search') || '')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalEmp,     setModalEmp]     = useState(null)
  const [showModal,    setShowModal]    = useState(false)
  const [toggling,     setToggling]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)       params.search = search
      if (filterStatus) params.status = filterStatus
      const [empRes, deptRes] = await Promise.all([
        employeeAPI.getAll(params),
        departmentAPI.getAll(),
      ])
      setEmployees(empRes.data)
      setDepartments(deptRes.data)
    } catch { toast.error('Failed to load employees') }
    finally { setLoading(false) }
  }, [search, filterStatus])

  useEffect(() => { load() }, [load])

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.firstName} ${emp.lastName}?`)) return
    try {
      await employeeAPI.delete(emp.id)
      toast.success('Employee deleted')
      load()
    } catch { toast.error('Delete failed') }
  }

  const handleToggleStatus = async (emp) => {
    setToggling(emp.id)
    try {
      const { data } = await employeeAPI.toggleStatus(emp.id)
      setEmployees(list => list.map(e => e.id === data.id ? data : e))
      toast.success(`${data.firstName} is now ${data.status}`)
    } catch { toast.error('Status toggle failed') }
    finally { setToggling(null) }
  }

  const statusBadge = (s) => {
    const map = { ACTIVE:'badge-active', INACTIVE:'badge-inactive', ON_LEAVE:'badge-pending', TERMINATED:'badge-rejected' }
    return <span className={`badge ${map[s] || ''}`}>{s}</span>
  }

  const initials = (emp) =>
    `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees <span>Directory</span></h1>
          <p className="page-subtitle">{employees.length} records found</p>
        </div>
        <button id="add-employee-btn" className="btn btn-primary" onClick={() => { setModalEmp({}); setShowModal(true) }}>
          <MdAdd /> Add Employee
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-search">
          <MdSearch style={{ color: 'var(--text-muted)', fontSize: 18 }} />
          <input
            placeholder="Search by name, email, title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Job Title</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Active</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding: 40 }}><div className="loader" /></td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="empty-state"><div className="empty-icon">👥</div><p>No employees found</p></div>
              </td></tr>
            ) : employees.map(emp => (
              <tr key={emp.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                    <div className="avatar">{initials(emp)}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color:'var(--text-secondary)' }}>{emp.jobTitle || '—'}</td>
                <td style={{ color:'var(--text-secondary)' }}>{emp.department?.name || '—'}</td>
                <td><span className={`badge ${emp.role==='ADMIN'?'badge-admin':emp.role==='MANAGER'?'badge-manager':'badge-inactive'}`}>{emp.role}</span></td>
                <td>{statusBadge(emp.status)}</td>
                <td>
                  <Toggle
                    id={`emp-active-${emp.id}`}
                    checked={emp.status === 'ACTIVE'}
                    disabled={toggling === emp.id || emp.status === 'TERMINATED'}
                    onChange={() => handleToggleStatus(emp)}
                  />
                </td>
                <td style={{ color:'var(--accent-3)', fontWeight:600 }}>
                  {emp.basicSalary ? `₹${Number(emp.basicSalary).toLocaleString()}` : '—'}
                </td>
                <td>
                  <div style={{ display:'flex', gap: 8 }}>
                    <button id={`edit-emp-${emp.id}`} className="btn btn-secondary btn-sm" onClick={() => { setModalEmp(emp); setShowModal(true) }}>
                      <MdEdit />
                    </button>
                    <button id={`delete-emp-${emp.id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)}>
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <EmployeeModal
          employee={modalEmp}
          departments={departments}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}
