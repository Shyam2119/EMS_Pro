import { useEffect, useState } from 'react'
import { performanceAPI, employeeAPI } from '../api/services'
import toast from 'react-hot-toast'
import { MdAdd, MdStar, MdDelete } from 'react-icons/md'

const STAR = (n) => '★'.repeat(n) + '☆'.repeat(5-n)
const RECOMMEND_COLOR = { PROMOTE:'badge-approved', RETAIN:'badge-active', IMPROVE:'badge-pending', TERMINATE:'badge-rejected' }

function ReviewModal({ employees, onClose, onSave }) {
  const [form, setForm] = useState({ employeeId:'', reviewerName:'', reviewPeriod:'', reviewDate:'', overallRating:3, technicalSkills:3, communication:3, teamwork:3, leadership:3, punctuality:3, strengths:'', areasOfImprovement:'', comments:'', recommendation:'RETAIN' })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employeeId||!form.reviewerName) { toast.error('Employee and reviewer required'); return }
    setLoading(true)
    const { employeeId, ...rest } = form
    try { await performanceAPI.create(employeeId, rest); toast.success('Review added!'); onSave() }
    catch { toast.error('Failed') } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header"><h2 className="modal-title">Add Performance Review</h2><button className="modal-close" onClick={onClose}>×</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Employee *</label><select className="form-control" value={form.employeeId} onChange={e=>set('employeeId',e.target.value)} required><option value="">-- Select --</option>{employees.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Reviewer *</label><input className="form-control" value={form.reviewerName} onChange={e=>set('reviewerName',e.target.value)} placeholder="Manager name" required /></div>
              <div className="form-group"><label className="form-label">Period (e.g. Q1 2024)</label><input className="form-control" value={form.reviewPeriod} onChange={e=>set('reviewPeriod',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Review Date</label><input type="date" className="form-control" value={form.reviewDate} onChange={e=>set('reviewDate',e.target.value)} /></div>
            </div>
            <div style={{ background:'var(--bg-base)',borderRadius:'var(--radius-md)',padding:16,marginBottom:16 }}>
              <div style={{ fontWeight:600,marginBottom:12,fontSize:14 }}>Ratings (1–5)</div>
              {[['overallRating','Overall'],['technicalSkills','Technical'],['communication','Communication'],['teamwork','Teamwork'],['leadership','Leadership'],['punctuality','Punctuality']].map(([k,l])=>(
                <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:13,color:'var(--text-secondary)',width:140}}>{l}</span>
                  <div style={{display:'flex',gap:4}}>
                    {[1,2,3,4,5].map(n=><button key={n} type="button" onClick={()=>set(k,n)} style={{fontSize:20,color:n<=form[k]?'#f59e0b':'var(--text-muted)',background:'none'}}>★</button>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Strengths</label><textarea className="form-control" rows={2} value={form.strengths} onChange={e=>set('strengths',e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Areas to Improve</label><textarea className="form-control" rows={2} value={form.areasOfImprovement} onChange={e=>set('areasOfImprovement',e.target.value)} /></div>
            </div>
            <div className="form-group"><label className="form-label">Recommendation</label><select className="form-control" value={form.recommendation} onChange={e=>set('recommendation',e.target.value)}><option>PROMOTE</option><option>RETAIN</option><option>IMPROVE</option><option>TERMINATE</option></select></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving...':'Submit Review'}</button></div>
        </form>
      </div>
    </div>
  )
}

export default function PerformancePage() {
  const [reviews,   setReviews]   = useState([])
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([performanceAPI.getAll(), employeeAPI.getAll()])
      .then(([pr,er])=>{ setReviews(pr.data); setEmployees(er.data) })
      .catch(()=>toast.error('Failed')).finally(()=>setLoading(false))
  }

  useEffect(load,[])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete review?')) return
    try { await performanceAPI.delete(id); toast.success('Deleted'); load() } catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Performance <span>Reviews</span></h1><p className="page-subtitle">{reviews.length} reviews on record</p></div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><MdAdd/> Add Review</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Employee</th><th>Reviewer</th><th>Period</th><th>Overall</th><th>Technical</th><th>Teamwork</th><th>Recommendation</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{textAlign:'center',padding:40}}><div className="loader"/></td></tr>
            : reviews.length===0 ? <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon"><MdStar style={{fontSize:48}}/></div><p>No reviews yet</p></div></td></tr>
            : reviews.map(r=>(
              <tr key={r.id}>
                <td style={{fontWeight:600}}>{r.employee?.firstName} {r.employee?.lastName}</td>
                <td style={{color:'var(--text-secondary)'}}>{r.reviewerName}</td>
                <td>{r.reviewPeriod||'—'}</td>
                <td style={{color:'#f59e0b'}}>{STAR(r.overallRating||0)}</td>
                <td style={{color:'#f59e0b'}}>{STAR(r.technicalSkills||0)}</td>
                <td style={{color:'#f59e0b'}}>{STAR(r.teamwork||0)}</td>
                <td><span className={`badge ${RECOMMEND_COLOR[r.recommendation]||''}`}>{r.recommendation}</span></td>
                <td style={{color:'var(--text-muted)',fontSize:13}}>{r.reviewDate||'—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={()=>handleDelete(r.id)}><MdDelete/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <ReviewModal employees={employees} onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);load()}}/>}
    </div>
  )
}
