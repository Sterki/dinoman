import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Meal, TodaySummary } from '../types'

type Period = 'all' | 'today' | '7d' | '30d'

export function useMeals(patientId: string, period: Period = 'all') {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Meal[]>(
        `/patients/${patientId}/meals${period !== 'all' ? `?period=${period}` : ''}`
      )
      setMeals(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [patientId, period])

  useEffect(() => { void load() }, [load])

  const create = useCallback(async (payload: Partial<Meal>): Promise<Meal> => {
    const created = await api.post<Meal>(`/patients/${patientId}/meals`, payload)
    setMeals(prev => [created, ...prev])
    return created
  }, [patientId])

  const update = useCallback(async (mealId: string, payload: Partial<Meal>): Promise<Meal> => {
    const updated = await api.put<Meal>(`/patients/${patientId}/meals/${mealId}`, payload)
    setMeals(prev => prev.map(m => m.id === mealId ? updated : m))
    return updated
  }, [patientId])

  const remove = useCallback(async (mealId: string): Promise<void> => {
    await api.delete(`/patients/${patientId}/meals/${mealId}`)
    setMeals(prev => prev.filter(m => m.id !== mealId))
  }, [patientId])

  const duplicate = useCallback(async (mealId: string, eatenAt?: string): Promise<Meal> => {
    const created = await api.post<Meal>(
      `/patients/${patientId}/meals/${mealId}/duplicate`,
      { eatenAt }
    )
    setMeals(prev => [created, ...prev])
    return created
  }, [patientId])

  return { meals, loading, error, reload: load, create, update, remove, duplicate }
}

export function useTodaySummary(patientId: string) {
  const [summary, setSummary] = useState<TodaySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<TodaySummary>(`/patients/${patientId}/meals/today-summary`)
      setSummary(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { void load() }, [load])

  return { summary, loading, error, reload: load }
}
