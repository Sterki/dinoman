import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Food } from '../types'

export function useFoods(search = '') {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ''
      const data = await api.get<Food[]>(`/foods${qs}`)
      setFoods(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { void load() }, [load])

  const create = useCallback(async (payload: Partial<Food>): Promise<Food> => {
    const created = await api.post<Food>('/foods', payload)
    setFoods(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    return created
  }, [])

  const update = useCallback(async (id: string, payload: Partial<Food>): Promise<Food> => {
    const updated = await api.put<Food>(`/foods/${id}`, payload)
    setFoods(prev => prev.map(f => f.id === id ? updated : f))
    return updated
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/foods/${id}`)
    setFoods(prev => prev.filter(f => f.id !== id))
  }, [])

  return { foods, loading, error, reload: load, create, update, remove }
}
