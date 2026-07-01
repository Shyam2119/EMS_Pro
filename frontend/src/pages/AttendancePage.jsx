import { useEffect, useState } from 'react'
import { attendanceAPI, employeeAPI } from '../api/services'
import toast from 'react-hot-toast'
import { MdLogin, MdLogout, MdToday } from 'react-icons/md'

const STATUS_COLORS = { PRESENT:'badge-approved', ABSENT:'badge-rejected', LATE:'badge-pending', HALF_DAY:'badge-pending', WORK_FROM_HOME:'badge-active', HOLIDAY:'badge-cancelled' }

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([])
  const [employees,  setEmployees]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selEmpId,   setSelEmpId]   = useState('')
  const [year,  setYear]  = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const load = () => {
    setLoading(true)
    const params = selEmpId ? { employeeId: selEmpId, year, month } : {}
    Promise.all([
      attendanceAPI.getAll(params),
      employeeAPI.getAll(),
    ]).then(([ar, er]) => { setAttendance(ar.data); setEmployees(er.data) })
    .catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))
  }

  useEffect(load, [selEmpId, year, month])

  const doCheckIn  = async (empId) => { try { await attendanceAPI.checkIn(empId);  toast.success('Checked in!');  load() } catch(e) { toast.error(e.response?.data?.message||'Failed') } }
  const doCheckOut = async (empId) => { try { await attendanceAPI.checkOut(empId); toast.success('Checked out!'); load() } catch(e) { toast.error(e.response?.data?.message||'Failed') } }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance <span>Tracker</span></h1>
          <p className="page-subtitle">Monitor daily attendance records</p>
        </div>
      </div>

      {/* Quick Check-In/Out */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><span className="card-title">Quick Check-In / Check-Out</span></div>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <select className="form-control" style={{ width:260 }} value={selEmpId} onChange={e=>setSelEmpId(e.target.value)}>
            <option value="">-- Select Employee --</option>
            {employees.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
          <button className="btn btn-success" disabled={!selEmpId} onClick={()=>doCheckIn(selEmpId)}><MdLogin/> Check In</button>
          <button className="btn btn-secondary" disabled={!selEmpId} onClick={()=>doCheckOut(selEmpId)}><MdLogout/> Check Out</button>
        </div>
      </div>

      {/* Filters */}
      <div className="toolbar" style={{ marginBottom: 20 }}>
        <select className="form-control" style={{ width:220 }} value={selEmpId} onChange={e=>setSelEmpId(e.target.value)}>
          <option value="">All Employees</option>
          {employees.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
        </select>
        <select className="form-control" style={{ width:120 }} value={month} onChange={e=>setMonth(Number(e.target.value))}>
          {MONTHS.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <input type="number" className="form-control" style={{ width:100 }} value={year} onChange={e=>setYear(Number(e.target.value))} min={2020} max={2030} />
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:40}}><div className="loader"/></td></tr>
            : attendance.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon"><MdToday style={{fontSize:48}}/></div><p>No attendance records for this period</p></div></td></tr>
            : attendance.map(a=>(
              <tr key={a.id}>
                <td>{a.employee?.firstName} {a.employee?.lastName}</td>
                <td style={{color:'var(--text-secondary)'}}>{a.date}</td>
                <td style={{color:'var(--accent-3)'}}>{a.checkIn||'—'}</td>
                <td style={{color:'var(--accent-2)'}}>{a.checkOut||'—'}</td>
                <td>{a.workingHours ? `${a.workingHours.toFixed(1)}h` : '—'}</td>
                <td><span className={`badge ${STATUS_COLORS[a.status]||''}`}>{a.status}</span></td>
                <td style={{color:'var(--text-muted)',fontSize:13}}>{a.notes||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
