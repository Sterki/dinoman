import { useCallback } from 'react'
import { api } from '../lib/api'
import type { MealFood } from '../types'

export function useMealFoods(mealId: string) {
  const add = useCallback(async (foodId: string, gramsConsumed: number): Promise<MealFood> => {
    return api.post<MealFood>(`/meals/${mealId}/foods`, { foodId, gramsConsumed })
  }, [mealId])

  const remove = useCallback(async (mealFoodId: string): Promise<void> => {
    return api.delete(`/meals/${mealId}/foods/${mealFoodId}`)
  }, [mealId])

  return { add, remove }
}
