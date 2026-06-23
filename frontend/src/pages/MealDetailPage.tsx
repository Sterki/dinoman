import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { AddFoodToMeal } from '../features/meals/AddFoodToMeal'
import { MealFoodItem } from '../features/meals/MealFoodItem'
import { useMealFoods } from '../hooks/useMealFoods'
import type { Meal, MealFood } from '../types'

export function MealDetailPage() {
  const { t } = useTranslation()
  const { patientId, mealId } = useParams<{ patientId: string; mealId: string }>()
  const navigate = useNavigate()

  const [meal, setMeal] = useState<Meal | null>(null)
  const [foods, setFoods] = useState<MealFood[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddFood, setShowAddFood] = useState(false)

  const { add, remove: removeMealFood } = useMealFoods(mealId ?? '')

  useEffect(() => {
    if (!patientId || !mealId) return
    setLoading(true)
    api.get<Meal>(`/patients/${patientId}/meals/${mealId}`)
      .then(m => { setMeal(m); setFoods(m.foods) })
      .finally(() => setLoading(false))
  }, [patientId, mealId])

  async function handleAddFood(foodId: string, grams: number) {
    const mf = await add(foodId, grams)
    setFoods(prev => [...prev, mf])
    setShowAddFood(false)
    setMeal(prev => prev ? { ...prev, totalCarbs: prev.totalCarbs + mf.carbsCalculated } : prev)
  }

  async function handleRemoveFood(mealFoodId: string) {
    const removed = foods.find(f => f.id === mealFoodId)
    await removeMealFood(mealFoodId)
    setFoods(prev => prev.filter(f => f.id !== mealFoodId))
    if (removed) setMeal(prev => prev ? { ...prev, totalCarbs: Math.max(0, prev.totalCarbs - removed.carbsCalculated) } : prev)
  }

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>
  if (!meal) return <AppLayout><EmptyState icon="❌" title={t('meals.notFound')} /></AppLayout>

  const eatenAtDate = new Date(meal.eatenAt).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <AppLayout title={meal.name}>
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500">{eatenAtDate}</p>
              {meal.notes && <p className="text-sm text-slate-600 mt-1">{meal.notes}</p>}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{meal.totalCarbs.toFixed(1)}g</p>
              <p className="text-xs text-slate-400">{t('meals.totalCarbs')}</p>
            </div>
          </div>
        </Card>

        {showAddFood ? (
          <Card><AddFoodToMeal onAdd={handleAddFood} onCancel={() => setShowAddFood(false)} /></Card>
        ) : (
          <Button fullWidth onClick={() => setShowAddFood(true)}>+ {t('foods.addFood')}</Button>
        )}

        {foods.length > 0 ? (
          <Card>{foods.map(mf => <MealFoodItem key={mf.id} mealFood={mf} onRemove={handleRemoveFood} />)}</Card>
        ) : (
          !showAddFood && <EmptyState icon="🥗" title={t('foods.noFoods')} description={t('foods.noFoodsDesc')} />
        )}

        <Button variant="secondary" fullWidth onClick={() => navigate(`/patients/${patientId}`)}>
          {t('meals.backToHistory')}
        </Button>
      </div>
    </AppLayout>
  )
}
