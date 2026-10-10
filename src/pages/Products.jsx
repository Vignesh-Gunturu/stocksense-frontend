import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'

const empty = {
  sku: '', barcode: '', name: '', description: '', categoryId: '', supplierId: '',
  unit: 'pcs', purchasePrice: 0, sellingPrice: 0, tax: 0,
  minStock: 0, maxStock: 1000, reorderPoint: 10, leadTimeDays: 7, currentStock: 0, status: 'ACTIVE'
}

export default function Products() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    const [p, c, s] = await Promise.all([api.get('/products'), api.get('/categories'), api.get('/suppliers')])
    setItems(p.data.data)
    setCategories(c.data.data)
    setSuppliers(s.data.data)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true); setError('') }
  const openEdit = (item) => {
    setEditing(item)
    setForm({
      sku: item.sku, barcode: item.barcode || '', name: item.name, description: item.description || '',
      categoryId: item.categoryId || '', supplierId: item.supplierId || '', unit: item.unit,
      purchasePrice: item.purchasePrice, sellingPrice: item.sellingPrice, tax: item.tax,
      minStock: item.minStock, maxStock: item.maxStock, reorderPoint: item.reorderPoint,
      leadTimeDays: item.leadTimeDays, currentStock: item.currentStock, status: item.status
    })
    setShowModal(true)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, categoryId: form.categoryId || null, supplierId: form.supplierId || null }
      if (editing) await api.put(`/products/${editing.id}`, payload)
      else await api.post('/products', payload)
      setShowModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    load()
  }

  const filtered = items.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))

  return (
    <Layout title="Products">
      <div className="toolbar">
        <input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, width: 280 }} />
        <button className="btn" onClick={openCreate}>+ New Product</button>
      </div>
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">No products found.</div>
        ) : (
          <table>
            <thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Stock</th><th>Status</th><th>Purchase</th><th>Selling</th><th></th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.categoryName || '—'}</td>
                  <td>{p.currentStock} {p.unit}</td>
                  <td><span className={`badge ${p.stockStatus.toLowerCase()}`}>{p.stockStatus.replaceAll('_', ' ')}</span></td>
                  <td>₹{p.purchasePrice}</td>
                  <td>₹{p.sellingPrice}</td>
                  <td>
                    <button className="btn secondary" onClick={() => openEdit(p)}>Edit</button>{' '}
                    <button className="btn danger" onClick={() => remove(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Product' : 'New Product'} onClose={() => setShowModal(false)}>
          <form onSubmit={submit}>
            {error && <p className="error-text">{error}</p>}
            <div className="form-grid">
              <div className="form-row"><label>SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required disabled={!!editing} /></div>
              <div className="form-row"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-row"><label>Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">— none —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-row"><label>Supplier</label>
                <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                  <option value="">— none —</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-row"><label>Purchase price</label><input type="number" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })} required /></div>
              <div className="form-row"><label>Selling price</label><input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} required /></div>
              <div className="form-row"><label>Current stock</label><input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })} disabled={!!editing} /></div>
              <div className="form-row"><label>Unit</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              <div className="form-row"><label>Min stock</label><input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} /></div>
              <div className="form-row"><label>Max stock</label><input type="number" value={form.maxStock} onChange={(e) => setForm({ ...form, maxStock: Number(e.target.value) })} /></div>
              <div className="form-row"><label>Reorder point</label><input type="number" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: Number(e.target.value) })} /></div>
              <div className="form-row"><label>Lead time (days)</label><input type="number" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: Number(e.target.value) })} /></div>
            </div>
            <div className="form-row"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            {editing && <p className="muted">To change stock levels, use the Inventory page (stock adjustments are logged).</p>}
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
