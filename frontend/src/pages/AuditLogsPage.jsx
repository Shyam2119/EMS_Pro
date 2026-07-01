import { useEffect, useState } from 'react'
import { dashboardAPI } from '../api/services'
import toast from 'react-hot-toast'
import { MdHistory, MdRefresh } from 'react-icons/md'

const ACTION_COLOR = {
  CREATE:'badge-approved', UPDATE:'badge-active', DELETE:'badge-rejected',
  LEAVE_APPLY:'badge-pending', APPROVED_LEAVE:'badge-approved', REJECTED_LEAVE:'badge-rejected',
  SCHEDULER_ABSENT:'badge-pending', SCHEDULER_SALARY:'badge-active',
  SCHEDULER_ATTENDANCE_SUMMARY:'badge-approved',
}

export default function AuditLogsPage() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('')

  const load = () => {
    setLoading(true)
    dashboardAPI.getAuditLogs()
      .then(r => setLogs(r.data))
      .catch(() => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = filter
    ? logs.filter(l => l.action?.includes(filter.toUpperCase()) || l.performedBy?.toLowerCase().includes(filter.toLowerCase()))
    : logs

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit <span>Logs</span></h1>
          <p className="page-subtitle">Complete system activity trail — {logs.length} entries</p>
        </div>
        <button className="btn btn-secondary" onClick={load}><MdRefresh /> Refresh</button>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <input placeholder="Filter by action or user..." value={filter} onChange={e=>setFilter(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Description</th>
              <th>Performed By</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:40}}><div className="loader"/></td></tr>
            : filtered.length===0 ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon"><MdHistory style={{fontSize:48}}/></div><p>No audit logs found</p></div></td></tr>
            : filtered.map((log,i) => (
              <tr key={log.id}>
                <td style={{color:'var(--text-muted)',fontSize:12}}>#{log.id}</td>
                <td><span className={`badge ${ACTION_COLOR[log.action]||'badge-inactive'}`}>{log.action}</span></td>
                <td style={{color:'var(--text-secondary)'}}>{log.entityType}{log.entityId ? ` #${log.entityId}` : ''}</td>
                <td style={{color:'var(--text-secondary)',fontSize:13,maxWidth:300}}>{log.description}</td>
                <td style={{fontWeight:500}}>{log.performedBy}</td>
                <td style={{color:'var(--text-muted)',fontSize:12,whiteSpace:'nowrap'}}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
