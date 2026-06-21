import { useEffect, useState } from 'react'

interface HealthResponse {
  status: string
  database: string
  timestamp: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<HealthResponse>
      })
      .then((data) => setHealth(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
      
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Diabetes App</h1>
      <p style={{ color: '#666', marginTop: 0 }}>React + Symfony + PostgreSQL</p>

      <hr style={{ margin: '1.5rem 0' }} />

      <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>API Health Check</h2>

      {loading && <p style={{ color: '#888' }}>Connecting to API…</p>}

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, padding: '0.75rem 1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {health && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, padding: '0.75rem 1rem' }}>
          <div>Status: <strong>{health.status}</strong></div>
          <div>Database: <strong>{health.database}</strong></div>
          <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.5rem' }}>{health.timestamp}</div>
        </div>
      )}
    </div>
  )
}

export default App
