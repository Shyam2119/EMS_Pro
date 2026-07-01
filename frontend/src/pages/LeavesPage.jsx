import { useEffect, useState } from 'react'
import { leaveAPI, employeeAPI } from '../api/services'
import toast from 'react-hot-toast'
import { MdAdd, MdCheck, MdClose, MdFilterList } from 'react-icons/md'

const LEAVE_TYPES = ['SICK','CASUAL','ANNUAL','MATERNITY','PATERNITY','UNPAID','EMERGENCY']
const STATUSES    = ['PENDING','APPROVED','REJECTED','CANCELLED']

function ApplyModal({ employees, onClose, onSave }) {
  const [form, setForm] = useState({ employeeId:'', leaveType:'CASUAL', startDate:'', endDate:'', reason:'' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employeeId||!form.startDate||!form.endDate) { toast.error('Fill all required fields'); return }
    setLoading(true)
    try {
      const { employeeId, ...rest } = form
      await leaveAPI.apply(employeeId, rest)
      toast.success('Leave applied!'); onSave()
    } catch(err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header"><h2 className="modal-title">Apply Leave</h2><button className="modal-close" onClick={onClose}>×</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Employee *</label>
              <select className="form-control" value={form.employeeId} onChange={e=>set('employeeId',e.target.value)} required>
                <option value="">-- Select Employee --</option>
                {employees.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Leave Type</label><select className="form-control" value={form.leaveType} onChange={e=>set('leaveType',e.target.value)}>{LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Start Date *</label><input type="date" className="form-control" value={form.startDate} onChange={e=>set('startDate',e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">End Date *</label><input type="date" className="form-control" value={form.endDate} onChange={e=>set('endDate',e.target.value)} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Reason</label><textarea className="form-control" rows={3} value={form.reason} onChange={e=>set('reason',e.target.value)} placeholder="Describe reason for leave..." /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Applying...':'Apply Leave'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LeavesPage() {
  const [leaves,    setLeaves]    = useState([])
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      leaveAPI.getAll(filterStatus ? { status: filterStatus } : {}),
      employeeAPI.getAll(),
    ]).then(([lr, er]) => { setLeaves(lr.data); setEmployees(er.data) })
    .catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))
  }

  useEffect(load, [filterStatus])

  const processLeave = async (id, status) => {
    const remarks = status === 'APPROVED' ? 'Approved' : window.prompt('Rejection reason:') || 'Rejected'
    try {
      await leaveAPI.process(id, { status, remarks })
      toast.success(`Leave ${status.toLowerCase()}`)
      load()
    } catch { toast.error('Failed') }
  }

  const statusBadge = s => {
    const map = { PENDING:'badge-pending', APPROVED:'badge-approved', REJECTED:'badge-rejected', CANCELLED:'badge-cancelled' }
    return <span className={`badge ${map[s]||''}`}>{s}</span>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave <span>Management</span></h1>
          <p className="page-subtitle">{leaves.length} leave requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><MdAdd /> Apply Leave</button>
      </div>

      <div className="toolbar">
        <select className="form-control" style={{ width:180 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:40}}><div className="loader"/></td></tr>
            : leaves.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📋</div><p>No leave requests</p></div></td></tr>
            : leaves.map(l => (
              <tr key={l.id}>
                <td><div style={{fontWeight:600}}>{l.employee?.firstName} {l.employee?.lastName}</div></td>
                <td><span className="badge badge-pending">{l.leaveType}</span></td>
                <td style={{color:'var(--text-secondary)'}}>{l.startDate}</td>
                <td style={{color:'var(--text-secondary)'}}>{l.endDate}</td>
                <td style={{color:'var(--text-secondary)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.reason||'—'}</td>
                <td>{statusBadge(l.status)}</td>
                <td>
                  {l.status==='PENDING' && (
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-success btn-sm" onClick={()=>processLeave(l.id,'APPROVED')}><MdCheck/></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>processLeave(l.id,'REJECTED')}><MdClose/></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <ApplyModal employees={employees} onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);load()}} />}
    </div>
  )
}
