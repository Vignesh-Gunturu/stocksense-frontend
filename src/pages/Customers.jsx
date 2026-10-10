import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'

const empty = { name: '', email: '', phone: '', address: '', customerType: 'REGULAR' }

export default function Customers() {
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await api.get('/customers')
    setItems(res.data.data)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true); setError('') }
  const openEdit = (item) => { setEditing(item); setForm(item); setShowModal(true); setError('') }

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editing) await api.put(`/customers/${editing.id}`, form)
      else await api.post('/customers', form)
      setShowModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this customer?')) return
    await api.delete(`/customers/${id}`)
    load()
  }

  return (
    <Layout title="Customers">
      <div className="toolbar">
        <span className="muted">{items.length} customers</span>
        <button className="btn" onClick={openCreate}>+ New Customer</button>
      </div>
      <div className="card">
        {items.length === 0 ? (
          <div className="empty-state">No customers yet.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Contact</th><th>Type</th><th></th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}<br />{c.phone}</td>
                  <td>{c.customerType}</td>
                  <td>
                    <button className="btn secondary" onClick={() => openEdit(c)}>Edit</button>{' '}
                    <button className="btn danger" onClick={() => remove(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Customer' : 'New Customer'} onClose={() => setShowModal(false)}>
          <form onSubmit={submit}>
            {error && <p className="error-text">{error}</p>}
            <div className="form-row"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-row"><label>Email</label><input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-row"><label>Phone</label><input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
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
