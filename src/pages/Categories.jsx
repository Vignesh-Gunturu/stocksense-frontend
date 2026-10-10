import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'

const empty = { name: '', description: '' }

export default function Categories() {
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await api.get('/categories')
    setItems(res.data.data)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true); setError('') }
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, description: item.description || '' }); setShowModal(true); setError('') }

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editing) await api.put(`/categories/${editing.id}`, form)
      else await api.post('/categories', form)
      setShowModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return
    await api.delete(`/categories/${id}`)
    load()
  }

  return (
    <Layout title="Categories">
      <div className="toolbar">
        <span className="muted">{items.length} categories</span>
        <button className="btn" onClick={openCreate}>+ New Category</button>
      </div>
      <div className="card">
        {items.length === 0 ? (
          <div className="empty-state">No categories yet. Create your first one.</div>
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Description</th><th>Products</th><th></th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.description}</td>
                  <td>{c.productCount}</td>
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
        <Modal title={editing ? 'Edit Category' : 'New Category'} onClose={() => setShowModal(false)}>
          <form onSubmit={submit}>
            {error && <p className="error-text">{error}</p>}
            <div className="form-row">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
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
