import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'

const empty = { name: '', company: '', email: '', phone: '', address: '', taxId: '', leadTimeDays: 7, rating: 0, status: 'ACTIVE' }

export default function Suppliers() {
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await api.get('/suppliers')
    setItems(res.data.data)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true); setError('') }
  const openEdit = (item) => { setEditing(item); setForm(item); setShowModal(true); setError('') }

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editing) await api.put(`/suppliers/${editing.id}`, form)
      else await api.post('/suppliers', form)
      setShowModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this supplier?')) return
    await api.delete(`/suppliers/${id}`)
    load()
  }

  return (
    <Layout title="Suppliers">
      <div className="toolbar">
        <span className="muted">{items.length} suppliers</span>
        <button className="btn" onClick={openCreate}>+ New Supplier</button>
      </div>
      <div className="card">
        {items.length === 0 ? (
          <div className="empty-state">No suppliers yet.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Company</th><th>Contact</th><th>Lead time</th><th>Rating</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.company}</td>
                  <td>{s.email}<br />{s.phone}</td>
                  <td>{s.leadTimeDays} days</td>
                  <td>{s.rating}</td>
                  <td>{s.status}</td>
                  <td>
                    <button className="btn secondary" onClick={() => openEdit(s)}>Edit</button>{' '}
                    <button className="btn danger" onClick={() => remove(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Supplier' : 'New Supplier'} onClose={() => setShowModal(false)}>
          <form onSubmit={submit}>
            {error && <p className="error-text">{error}</p>}
            <div className="form-grid">
              <div className="form-row"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-row"><label>Company</label><input value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div className="form-row"><label>Email</label><input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-row"><label>Phone</label><input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-row"><label>Tax ID</label><input value={form.taxId || ''} onChange={(e) => setForm({ ...form, taxId: e.target.value })} /></div>
              <div className="form-row"><label>Lead time (days)</label><input type="number" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: Number(e.target.value) })} /></div>
            </div>
            <div className="form-row"><label>Address</label><textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
