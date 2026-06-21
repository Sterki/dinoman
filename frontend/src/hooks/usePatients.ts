import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Patient } from '../types'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Patient[]>('/patients')
      setPatients(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const create = useCallback(async (payload: Partial<Patient>): Promise<Patient> => {
    const created = await api.post<Patient>('/patients', payload)
    setPatients(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    return created
  }, [])

  const update = useCallback(async (id: string, payload: Partial<Patient>): Promise<Patient> => {
    const updated = await api.put<Patient>(`/patients/${id}`, payload)
    setPatients(prev => prev.map(p => p.id === id ? updated : p))
    return updated
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`)
    setPatients(prev => prev.filter(p => p.id !== id))
  }, [])

  return { patients, loading, error, reload: load, create, update, remove }
}
