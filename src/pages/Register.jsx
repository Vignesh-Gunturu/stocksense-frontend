import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [businessName, setBusinessName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await register(businessName, adminName, email, password)
    if (res.success) navigate('/dashboard')
    else setError(res.message)
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create your business</h2>
        <p className="muted">Set up your business and admin account.</p>
        {error && <p className="error-text">{error}</p>}
        <div className="form-row">
          <label>Business name</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Your name</label>
          <input value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password (min 6 chars)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <button className="btn" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creating...' : 'Create business'}
        </button>
        <p className="muted" style={{ marginTop: 14 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
