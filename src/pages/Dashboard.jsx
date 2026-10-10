import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

function Kpi({ label, value }) {
  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await api.get('/dashboard')
      setData(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard')
    }
  }

  useEffect(() => { load() }, [])

  if (error) return <Layout title="Dashboard"><p className="error-text">{error}</p></Layout>
  if (!data) return <Layout title="Dashboard"><p className="muted">Loading...</p></Layout>

  const currency = (v) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <Layout title="Dashboard">
      <div className="grid cols-4" style={{ marginBottom: 20 }}>
        <Kpi label="Total Products" value={data.totalProducts} />
        <Kpi label="Total Stock Units" value={data.totalStockUnits} />
        <Kpi label="Inventory Value" value={currency(data.inventoryValue)} />
        <Kpi label="Today's Sales" value={currency(data.todaysSales)} />
        <Kpi label="Monthly Revenue" value={currency(data.monthlyRevenue)} />
        <Kpi label="Monthly Profit" value={currency(data.monthlyProfit)} />
        <Kpi label="Pending Purchases" value={data.pendingPurchases} />
        <Kpi label="Low Stock Items" value={data.lowStockItems} />
        <Kpi label="Out of Stock" value={data.outOfStockItems} />
        <Kpi label="Overstock Items" value={data.overstockItems} />
        <Kpi label="Potential Sales Value" value={currency(data.potentialSalesValue)} />
      </div>

      <div className="grid cols-2">
        <div className="card">
          <p className="section-title">Top Products This Month (by revenue)</p>
          {data.topProductsByRevenue.length === 0 ? (
            <p className="muted">No sales recorded this month yet.</p>
          ) : (
            <table>
              <thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.topProductsByRevenue.map((p) => (
                  <tr key={p.productId}>
                    <td>{p.name}</td>
                    <td>{p.unitsSold}</td>
                    <td>{currency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <p className="section-title">AI Business Insights</p>
          {data.insights.length === 0 ? (
            <p className="muted">No insights yet — generate demand predictions to unlock this.</p>
          ) : (
            <ul className="insight-list">
              {data.insights.map((ins, idx) => (
                <li key={idx}><strong>{ins.type.replaceAll('_', ' ')}:</strong> {ins.message}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}
