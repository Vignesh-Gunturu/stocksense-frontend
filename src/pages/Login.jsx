import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (res.success) navigate('/dashboard')
    else setError(res.message)
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p className="muted">Sign in to your StockSense AI account.</p>
        {error && <p className="error-text">{error}</p>}
        <div className="form-row">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="muted" style={{ marginTop: 14 }}>
          No account? <Link to="/register">Register your business</Link>
        </p>
        <p className="muted">Demo login: admin@demo.com / Admin@123</p>
      </form>
    </div>
  )
}
