import { useEffect, useState } from 'react'
import { departmentAPI } from '../api/services'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdBusiness, MdPeople, MdLocationOn } from 'react-icons/md'

function DeptModal({ dept, onClose, onSave }) {
  const isEdit = !!dept?.id
  const [form, setForm] = useState({ name:'', description:'', location:'', managerName:'', budget:'', ...dept })
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) { toast.error('Department name is required'); return }
    setLoading(true)
    try {
      if (isEdit) await departmentAPI.update(dept.id, form)
      else        await departmentAPI.create(form)
      toast.success(isEdit ? 'Department updated!' : 'Department created!')
      onSave()
    } catch(err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal animate-slide-up">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit?'Edit':'Add'} Department</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Name *</label><input className="form-control" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Engineering" required /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Department overview..." /></div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Location</label><input className="form-control" value={form.location} onChange={e=>set('location',e.target.value)} placeholder="e.g. Floor 3" /></div>
              <div className="form-group"><label className="form-label">Manager</label><input className="form-control" value={form.managerName} onChange={e=>set('managerName',e.target.value)} placeholder="Manager name" /></div>
              <div className="form-group"><label className="form-label">Budget (₹)</label><input type="number" className="form-control" value={form.budget} onChange={e=>set('budget',e.target.value)} placeholder="500000" /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving...':(isEdit?'Update':'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(null)
  const [showModal,   setShowModal]   = useState(false)

  const load = () => {
    setLoading(true)
    departmentAPI.getAll()
      .then(r => setDepartments(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete "${dept.name}"?`)) return
    try { await departmentAPI.delete(dept.id); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments <span>Management</span></h1>
          <p className="page-subtitle">{departments.length} departments configured</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setModal({}); setShowModal(true) }}><MdAdd /> Add Department</button>
      </div>

      {loading ? <div className="loading-page"><div className="loader" /></div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
          {departments.length === 0 ? (
            <div className="empty-state" style={{ gridColumn:'1/-1' }}>
              <div className="empty-icon"><MdBusiness /></div>
              <p>No departments yet. Add your first one!</p>
            </div>
          ) : departments.map(d => (
            <div key={d.id} className="card" style={{ position:'relative' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 16 }}>
                <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                  <div style={{ width:44,height:44,background:'rgba(124,58,237,0.15)',borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,color:'var(--accent-light)' }}><MdBusiness /></div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:16 }}>{d.name}</div>
                    {d.location && <div style={{ fontSize:12,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4,marginTop:2 }}><MdLocationOn style={{fontSize:13}}/>{d.location}</div>}
                  </div>
                </div>
                <div style={{ display:'flex',gap:6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setModal(d); setShowModal(true) }}><MdEdit /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d)}><MdDelete /></button>
                </div>
              </div>
              {d.description && <p style={{ fontSize:13,color:'var(--text-secondary)',marginBottom:14 }}>{d.description}</p>}
              <div style={{ display:'flex',gap:16,borderTop:'1px solid var(--border)',paddingTop:14,marginTop:'auto' }}>
                <div><div style={{ fontSize:12,color:'var(--text-muted)' }}>Manager</div><div style={{ fontSize:14,fontWeight:500 }}>{d.managerName||'—'}</div></div>
                <div><div style={{ fontSize:12,color:'var(--text-muted)' }}>Headcount</div><div style={{ fontSize:14,fontWeight:500,display:'flex',alignItems:'center',gap:4 }}><MdPeople/>{d.employees?.length||0}</div></div>
                {d.budget && <div><div style={{ fontSize:12,color:'var(--text-muted)' }}>Budget</div><div style={{ fontSize:14,fontWeight:500,color:'var(--accent-3)' }}>₹{Number(d.budget).toLocaleString()}</div></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <DeptModal dept={modal} onClose={()=>setShowModal(false)} onSave={()=>{setShowModal(false);load()}} />}
    </div>
  )
}
