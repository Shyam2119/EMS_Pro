import { useEffect, useState } from 'react'
import { salaryAPI, employeeAPI } from '../api/services'
import toast from 'react-hot-toast'
import { MdAdd, MdDelete, MdPayments } from 'react-icons/md'

function SalaryModal({ employees, onClose, onSave }) {
  const [form, setForm] = useState({ employeeId:'', month:'', basicSalary:'', hra:'', transport:'', medical:'', otherAllowances:'', pfDeduction:'', taxDeduction:'', otherDeductions:'', paymentStatus:'PENDING', remarks:'' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employeeId||!form.month||!form.basicSalary) { toast.error('Employee, month, and basic salary are required'); return }
    setLoading(true)
    const { employeeId, ...rest } = form
    try { await salaryAPI.create(employeeId, rest); toast.success('Salary record added!'); onSave() }
    catch(err) { toast.error(err.response?.data?.message||'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header"><h2 className="modal-title">Add Salary Record</h2><button className="modal-close" onClick={onClose}>×</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Employee *</label><select className="form-control" value={form.employeeId} onChange={e=>set('employeeId',e.target.value)} required><option value="">-- Select --</option>{employees.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Month * (e.g. 2024-06)</label><input className="form-control" value={form.month} onChange={e=>set('month',e.target.value)} placeholder="2024-06" required /></div>
              <div className="form-group"><label className="form-label">Basic Salary *</label><input type="number" className="form-control" value={form.basicSalary} onChange={e=>set('basicSalary',e.target.value)} placeholder="50000" required /></div>
              <div className="form-group"><label className="form-label">HRA</label><input type="number" className="form-control" value={form.hra} onChange={e=>set('hra',e.target.value)} placeholder="10000" /></div>
              <div className="form-group"><label className="form-label">Transport</label><input type="number" className="form-control" value={form.transport} onChange={e=>set('transport',e.target.value)} placeholder="2000" /></div>
              <div className="form-group"><label className="form-label">Medical</label><input type="number" className="form-control" value={form.medical} onChange={e=>set('medical',e.target.value)} placeholder="1500" /></div>
              <div className="form-group"><label className="form-label">PF Deduction</label><input type="number" className="form-control" value={form.pfDeduction} onChange={e=>set('pfDeduction',e.target.value)} placeholder="6000" /></div>
              <div className="form-group"><label className="form-label">Tax Deduction</label><input type="number" className="form-control" value={form.taxDeduction} onChange={e=>set('taxDeduction',e.target.value)} placeholder="5000" /></div>
              <div className="form-group"><label className="form-label">Status</label><select className="form-control" value={form.paymentStatus} onChange={e=>set('paymentStatus',e.target.value)}><option>PENDING</option><option>PAID</option><option>ON_HOLD</option></select></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving...':'Add Record'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SalaryPage() {
  const [salaries,  setSalaries]  = useState([])
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterEmp, setFilterEmp] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      salaryAPI.getAll(filterEmp ? { employeeId: filterEmp } : {}),
      employeeAPI.getAll(),
    ]).then(([sr, er]) => { setSalaries(sr.data); setEmployees(er.data) })
    .catch(() => toast.error('Failed')).finally(() => setLoading(false))
  }

  useEffect(load, [filterEmp])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this salary record?')) return
    try { await salaryAPI.delete(id); toast.success('Deleted'); load() } catch { toast.error('Failed') }
  }

  const fmt = (n) => n ? `₹${Number(n).toLocaleString()}` : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Salary <span>Management</span></h1>
          <p className="page-subtitle">{salaries.length} payroll records</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><MdAdd/> Add Record</button>
      </div>

      <div className="toolbar">
        <select className="form-control" style={{width:240}} value={filterEmp} onChange={e=>setFilterEmp(e.target.value)}>
          <option value="">All Employees</option>
          {employees.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Employee</th><th>Month</th><th>Basic</th><th>HRA</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{textAlign:'center',padding:40}}><div className="loader"/></td></tr>
            : salaries.length===0 ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon"><MdPayments style={{fontSize:48}}/></div><p>No salary records yet</p></div></td></tr>
            : salaries.map(s=>(
              <tr key={s.id}>
                <td><div style={{fontWeight:600}}>{s.employee?.firstName} {s.employee?.lastName}</div></td>
                <td><span className="badge badge-active">{s.month}</span></td>
                <td>{fmt(s.basicSalary)}</td>
                <td style={{color:'var(--text-secondary)'}}>{fmt(s.hra)}</td>
                <td style={{color:'var(--accent-danger)'}}>{fmt((s.pfDeduction||0)+(s.taxDeduction||0)+(s.otherDeductions||0))}</td>
                <td style={{color:'var(--accent-3)',fontWeight:700,fontSize:15}}>{fmt(s.netPay)}</td>
                <td><span className={`badge ${s.paymentStatus==='PAID'?'badge-approved':s.paymentStatus==='ON_HOLD'?'badge-pending':'badge-inactive'}`}>{s.paymentStatus}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={()=>handleDelete(s.id)}><MdDelete/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <SalaryModal employees={employees} onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);load()}}/>}
    </div>
  )
}
