import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Stats } from '../types'

export function useStats(patientId: string, period: '7d' | '30d' = '7d') {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Stats>(`/patients/${patientId}/stats?period=${period}`)
      setStats(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [patientId, period])

  useEffect(() => { void load() }, [load])

  return { stats, loading, error, reload: load }
}
