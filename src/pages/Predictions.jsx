import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Predictions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [forecastDays, setForecastDays] = useState(30)
  const [error, setError] = useState('')

  const load = async () => {
    const res = await api.get('/predictions')
    setItems(res.data.data)
  }
  useEffect(() => { load() }, [])

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post(`/predictions/generate?forecastDays=${forecastDays}`)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate predictions')
    } finally {
      setLoading(false)
    }
  }

  const chartData = items
    .slice()
    .sort((a, b) => b.avgDailyDemand - a.avgDailyDemand)
    .slice(0, 8)
    .map((p) => ({ name: p.productName, avgDailyDemand: p.avgDailyDemand }))

  return (
    <Layout title="Demand Predictions">
      <div className="toolbar">
        <div>
          <label className="muted">Forecast period: </label>
          <select value={forecastDays} onChange={(e) => setForecastDays(Number(e.target.value))} style={{ marginLeft: 6 }}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Predictions'}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="section-title">Average Daily Demand — Top Products</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgDailyDemand" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        {items.length === 0 ? (
          <div className="empty-state">
            No predictions yet. Click "Generate Predictions" — you need some sales history recorded first.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Avg Daily Demand</th><th>Predicted Demand</th>
                <th>Reorder Point</th><th>Recommended Order</th><th>Days to Stockout</th>
                <th>Risk</th><th>Trend</th><th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.productName}</td>
                  <td>{p.avgDailyDemand}</td>
                  <td>{p.predictedDemand} ({p.forecastPeriodDays}d)</td>
                  <td>{p.reorderPoint}</td>
                  <td>{p.recommendedOrderQty > 0 ? Math.ceil(p.recommendedOrderQty) : '—'}</td>
                  <td>{p.daysUntilStockout >= 999 ? '—' : Math.round(p.daysUntilStockout)}</td>
                  <td><span className={`badge ${p.riskLevel.toLowerCase()}`}>{p.riskLevel}</span></td>
                  <td><span className={`badge ${p.trend.toLowerCase()}`}>{p.trend}</span></td>
                  <td>{p.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
