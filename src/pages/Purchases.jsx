import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'

export default function Purchases() {
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [showReceive, setShowReceive] = useState(null)
  const [error, setError] = useState('')

  const [supplierId, setSupplierId] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [lines, setLines] = useState([{ productId: '', quantity: 1, purchasePrice: '' }])
  const [receiveQtys, setReceiveQtys] = useState({})

  const load = async () => {
    const [po, s, p] = await Promise.all([api.get('/purchases'), api.get('/suppliers'), api.get('/products')])
    setItems(po.data.data)
    setSuppliers(s.data.data)
    setProducts(p.data.data)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setSupplierId(''); setExpectedDelivery('')
    setLines([{ productId: '', quantity: 1, purchasePrice: '' }])
    setError(''); setShowCreate(true)
  }

  const addLine = () => setLines([...lines, { productId: '', quantity: 1, purchasePrice: '' }])
  const updateLine = (idx, field, value) => {
    const copy = [...lines]
    copy[idx] = { ...copy[idx], [field]: value }
    setLines(copy)
  }
  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx))

  const submitCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        supplierId: Number(supplierId),
        expectedDelivery: expectedDelivery || null,
        items: lines.map((l) => ({
          productId: Number(l.productId),
          quantity: Number(l.quantity),
          purchasePrice: l.purchasePrice ? Number(l.purchasePrice) : null
        }))
      }
      await api.post('/purchases', payload)
      setShowCreate(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create purchase order')
    }
  }

  const openReceive = (po) => {
    const defaults = {}
    po.items.forEach((i) => { defaults[i.id] = Math.max(0, i.quantity - i.quantityReceived) })
    setReceiveQtys(defaults)
    setShowReceive(po)
    setError('')
  }

  const submitReceive = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        items: Object.entries(receiveQtys)
          .filter(([, qty]) => Number(qty) > 0)
          .map(([purchaseOrderItemId, qty]) => ({
            purchaseOrderItemId: Number(purchaseOrderItemId),
            quantityReceived: Number(qty)
          }))
      }
      await api.post(`/purchases/${showReceive.id}/receive`, payload)
      setShowReceive(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to receive stock')
    }
  }

  const cancelPo = async (id) => {
    if (!confirm('Cancel this purchase order?')) return
    await api.post(`/purchases/${id}/cancel`)
    load()
  }

  return (
    <Layout title="Purchase Orders">
      <div className="toolbar">
        <span className="muted">{items.length} purchase orders</span>
        <button className="btn" onClick={openCreate}>+ New Purchase Order</button>
      </div>
      <div className="card">
        {items.length === 0 ? (
          <div className="empty-state">No purchase orders yet.</div>
        ) : (
          <table>
            <thead><tr><th>#</th><th>Supplier</th><th>Status</th><th>Order date</th><th>Expected</th><th>Total</th><th></th></tr></thead>
            <tbody>
              {items.map((po) => (
                <tr key={po.id}>
                  <td>PO-{po.id}</td>
                  <td>{po.supplierName}</td>
                  <td><span className="badge low_stock">{po.status.replaceAll('_', ' ')}</span></td>
                  <td>{po.orderDate}</td>
                  <td>{po.expectedDelivery || '—'}</td>
                  <td>₹{po.totalAmount?.toLocaleString('en-IN')}</td>
                  <td>
                    {(po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') && (
                      <button className="btn secondary" onClick={() => openReceive(po)}>Receive</button>
                    )}{' '}
                    {po.status === 'ORDERED' && (
                      <button className="btn danger" onClick={() => cancelPo(po.id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <Modal title="New Purchase Order" onClose={() => setShowCreate(false)}>
          <form onSubmit={submitCreate}>
            {error && <p className="error-text">{error}</p>}
            <div className="form-row">
              <label>Supplier</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                <option value="">Select supplier</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Expected delivery</label>
              <input type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} />
            </div>
            <p className="section-title">Items</p>
            {lines.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select value={line.productId} onChange={(e) => updateLine(idx, 'productId', e.target.value)} required style={{ flex: 2 }}>
                  <option value="">Product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" min="1" placeholder="Qty" value={line.quantity}
                  onChange={(e) => updateLine(idx, 'quantity', e.target.value)} required style={{ width: 70 }} />
                <input type="number" step="0.01" placeholder="Price (optional)" value={line.purchasePrice}
                  onChange={(e) => updateLine(idx, 'purchasePrice', e.target.value)} style={{ width: 120 }} />
                {lines.length > 1 && <button type="button" className="btn danger" onClick={() => removeLine(idx)}>×</button>}
              </div>
            ))}
            <button type="button" className="btn secondary" onClick={addLine}>+ Add line</button>
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn">Create Order</button>
            </div>
          </form>
        </Modal>
      )}

      {showReceive && (
        <Modal title={`Receive stock — PO-${showReceive.id}`} onClose={() => setShowReceive(null)}>
          <form onSubmit={submitReceive}>
            {error && <p className="error-text">{error}</p>}
            {showReceive.items.map((i) => (
              <div key={i.id} className="form-row">
                <label>{i.productName} (ordered {i.quantity}, received {i.quantityReceived})</label>
                <input type="number" min="0" max={i.quantity - i.quantityReceived}
                  value={receiveQtys[i.id] ?? 0}
                  onChange={(e) => setReceiveQtys({ ...receiveQtys, [i.id]: e.target.value })} />
              </div>
            ))}
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={() => setShowReceive(null)}>Cancel</button>
              <button className="btn">Confirm Receipt</button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}
