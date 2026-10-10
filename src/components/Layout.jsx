import React from 'react'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Layout({ title, children }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <h1>{title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn secondary" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <span className="muted">{user?.name} · {user?.role?.replaceAll('_', ' ')}</span>
            <button className="btn secondary" onClick={logout}>Logout</button>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}