import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'

export default function Sales() {
  const [items, setItems] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const [customerId, setCustomerId] = useState('')
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [lines, setLines] = useState([{ productId: '', quantity: 1, price: '' }])

  const load = async () => {
    const [sales, c, p] = await Promise.all([api.get('/sales'), api.get('/customers'), api.get('/products')])
    setItems(sales.data.data)
    setCustomers(c.data.data)
    setProducts(p.data.data)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setCustomerId(''); setDiscount(0); setTax(0)
    setLines([{ productId: '', quantity: 1, price: '' }])
    setError(''); setShowModal(true)
  }

  const addLine = () => setLines([...lines, { productId: '', quantity: 1, price: '' }])
  const updateLine = (idx, field, value) => {
    const copy = [...lines]
    copy[idx] = { ...copy[idx], [field]: value }
    setLines(copy)
  }
  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx))

  const productPrice = (id) => products.find((p) => String(p.id) === String(id))?.sellingPrice || 0
  const estimatedTotal = lines.reduce((sum, l) => {
    const price = l.price ? Number(l.price) : productPrice(l.productId)
    return sum + price * Number(l.quantity || 0)
  }, 0) - Number(discount || 0) + Number(tax || 0)

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        customerId: customerId || null,
        discount: Number(discount || 0),
        tax: Number(tax || 0),
        items: lines.map((l) => ({
          productId: Number(l.productId),
          quantity: Number(l.quantity),
          price: l.price ? Number(l.price) : null
        }))
      }
      await api.post('/sales', payload)
      setShowModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale')
    }
  }

  return (
    <Layout title="Sales">
      <div className="toolbar">
        <span className="muted">{items.length} sales recorded</span>
        <button className="btn" onClick={openCreate}>+ New Sale</button>
      </div>
      <div className="card">
        {items.length === 0 ? (
          <div className="empty-state">No sales yet.</div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>SALE-{s.id}</td>
                  <td>{new Date(s.saleDate).toLocaleString()}</td>
                  <td>{s.customerName}</td>
                  <td>{s.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}</td>
                  <td>₹{s.totalAmount?.toLocaleString('en-IN')}</td>
                  <td>{s.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title="New Sale" onClose={() => setShowModal(false)}>
          <form onSubmit={submit}>
            {error && <p className="error-text">{error}</p>}
            <div className="form-row">
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Walk-in customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <p className="section-title">Items</p>
            {lines.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select value={line.productId} onChange={(e) => updateLine(idx, 'productId', e.target.value)} required style={{ flex: 2 }}>
                  <option value="">Product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.currentStock} in stock)</option>)}
                </select>
                <input type="number" min="1" placeholder="Qty" value={line.quantity}
                  onChange={(e) => updateLine(idx, 'quantity', e.target.value)} required style={{ width: 70 }} />
                <input type="number" step="0.01" placeholder={`₹${productPrice(line.productId) || 'price'}`} value={line.price}
                  onChange={(e) => updateLine(idx, 'price', e.target.value)} style={{ width: 110 }} />
                {lines.length > 1 && <button type="button" className="btn danger" onClick={() => removeLine(idx)}>×</button>}
              </div>
            ))}
            <button type="button" className="btn secondary" onClick={addLine}>+ Add line</button>

            <div className="form-grid" style={{ marginTop: 12 }}>
              <div className="form-row"><label>Discount (₹)</label><input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
              <div className="form-row"><label>Tax (₹)</label><input type="number" step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} /></div>
            </div>
            <p className="muted">Estimated total: <strong>₹{estimatedTotal.toFixed(2)}</strong></p>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn">Complete Sale</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
