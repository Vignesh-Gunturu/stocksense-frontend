import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'

const empty = { productId: '', type: 'STOCK_IN', quantity: 1, reason: '' }

const MOVEMENT_TYPES = ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'DAMAGED', 'RETURNED', 'LOST']

export default function Inventory() {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const load = async () => {
    const [m, p] = await Promise.all([api.get('/inventory/movements'), api.get('/products')])
    setMovements(m.data.data)
    setProducts(p.data.data)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setShowModal(true); setError('') }

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/inventory/adjust', { ...form, productId: Number(form.productId), quantity: Number(form.quantity) })
      setShowModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record stock movement')
    }
  }

  return (
    <Layout title="Inventory Movements">
      <div className="toolbar">
        <span className="muted">Every stock change creates an immutable movement record.</span>
        <button className="btn" onClick={openCreate}>+ Adjust Stock</button>
      </div>
      <div className="card">
        {movements.length === 0 ? (
          <div className="empty-state">No stock movements yet.</div>
        ) : (
          <table>
            <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Reason</th><th>By</th></tr></thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>{m.productName}</td>
                  <td>{m.type.replaceAll('_', ' ')}</td>
                  <td>{m.quantity}</td>
                  <td>{m.reason || '—'}</td>
                  <td>{m.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title="Adjust Stock" onClose={() => setShowModal(false)}>
          <form onSubmit={submit}>
            {error && <p className="error-text">{error}</p>}
            <div className="form-row">
              <label>Product</label>
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
                <option value="">Select a product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.currentStock} {p.unit} in stock)</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Movement type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {MOVEMENT_TYPES.map((t) => <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>)}
              </select>
              <span className="muted">STOCK_IN / RETURNED add to stock. STOCK_OUT / DAMAGED / LOST remove from stock.</span>
            </div>
            <div className="form-row">
              <label>Quantity</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              <span className="muted">For ADJUSTMENT, use a negative number to reduce stock (e.g. -5).</span>
            </div>
            <div className="form-row">
              <label>Reason / note</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
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
