import { useEffect, useState } from 'react'
import { announcementAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdCampaign } from 'react-icons/md'
import Toggle from '../components/Toggle'

const PRIORITY_COLOR = { LOW:'badge-inactive', NORMAL:'badge-active', HIGH:'badge-pending', URGENT:'badge-rejected' }
const CATEGORIES = ['GENERAL','POLICY','HOLIDAY','EVENT','ACHIEVEMENT','ALERT']

function AnnouncementModal({ item, onClose, onSave }) {
  const { user } = useAuth()
  const isEdit = !!item?.id
  const [form, setForm] = useState({ title:'', content:'', priority:'NORMAL', category:'GENERAL', active:true, postedBy: user?.firstName || 'Admin', ...item })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title||!form.content) { toast.error('Title and content required'); return }
    setLoading(true)
    try {
      if (isEdit) await announcementAPI.update(item.id, form)
      else        await announcementAPI.create(form)
      toast.success(isEdit?'Updated!':'Posted!'); onSave()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header"><h2 className="modal-title">{isEdit?'Edit':'Post'} Announcement</h2><button className="modal-close" onClick={onClose}>×</button></div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Announcement title..." required /></div>
            <div className="form-group"><label className="form-label">Content *</label><textarea className="form-control" rows={5} value={form.content} onChange={e=>set('content',e.target.value)} placeholder="Write your announcement..." required /></div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Priority</label><select className="form-control" value={form.priority} onChange={e=>set('priority',e.target.value)}><option>LOW</option><option>NORMAL</option><option>HIGH</option><option>URGENT</option></select></div>
              <div className="form-group"><label className="form-label">Category</label><select className="form-control" value={form.category} onChange={e=>set('category',e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Posting...':(isEdit?'Update':'Post')}</button></div>
        </form>
      </div>
    </div>
  )
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [showModal,setShowModal]= useState(false)
  const { isAdmin } = useAuth()

  const load = () => {
    setLoading(true)
    announcementAPI.getAll()
      .then(r=>setAnnouncements(r.data)).catch(()=>toast.error('Failed')).finally(()=>setLoading(false))
  }

  useEffect(load,[])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete announcement?')) return
    try { await announcementAPI.delete(id); toast.success('Deleted'); load() } catch { toast.error('Failed') }
  }

  const handleToggle = async (a) => {
    try {
      const { data } = await announcementAPI.toggle(a.id)
      setAnnouncements(list => list.map(x => x.id === data.id ? data : x))
      toast.success(data.active ? 'Announcement activated' : 'Announcement deactivated')
    } catch { toast.error('Toggle failed') }
  }

  const URGENCY_BORDER = { URGENT:'var(--accent-danger)', HIGH:'var(--accent-warn)', NORMAL:'var(--accent)', LOW:'var(--border)' }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Announcements <span>Board</span></h1><p className="page-subtitle">{announcements.length} announcements</p></div>
        {isAdmin() && <button className="btn btn-primary" onClick={()=>{ setModal({}); setShowModal(true) }}><MdAdd/> Post Announcement</button>}
      </div>

      {loading ? <div className="loading-page"><div className="loader"/></div>
      : announcements.length===0 ? <div className="empty-state"><div className="empty-icon"><MdCampaign style={{fontSize:64}}/></div><p>No announcements yet</p></div>
      : <div style={{ display:'flex', flexDirection:'column', gap: 16 }}>
          {announcements.map(a=>(
            <div key={a.id} className="card" style={{ borderLeft:`3px solid ${URGENCY_BORDER[a.priority]||'var(--border)'}` }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <h3 style={{ fontSize:16, fontWeight:700 }}>{a.title}</h3>
                  <span className={`badge ${PRIORITY_COLOR[a.priority]||''}`}>{a.priority}</span>
                  <span className="badge badge-inactive">{a.category}</span>
                  {!a.active && <span className="badge badge-cancelled">INACTIVE</span>}
                </div>
                {isAdmin() && (
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <Toggle
                      id={`ann-toggle-${a.id}`}
                      checked={a.active}
                      onChange={() => handleToggle(a)}
                    />
                    <button className="btn btn-secondary btn-sm" onClick={()=>{ setModal(a); setShowModal(true) }}><MdEdit/></button>
                    <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(a.id)}><MdDelete/></button>
                  </div>
                )}
              </div>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.7, marginBottom:12 }}>{a.content}</p>
              <div style={{ fontSize:12, color:'var(--text-muted)', display:'flex', gap:16 }}>
                <span>By {a.postedBy||'Admin'}</span>
                <span>{a.postedAt ? new Date(a.postedAt).toLocaleString() : ''}</span>
              </div>
            </div>
          ))}
        </div>}

      {showModal && <AnnouncementModal item={modal} onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);load()}}/>}
    </div>
  )
}
