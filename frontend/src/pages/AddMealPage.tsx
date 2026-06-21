import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { AddFoodToMeal } from '../features/meals/AddFoodToMeal'
import { MealFoodItem } from '../features/meals/MealFoodItem'
import { MealForm } from '../features/meals/MealForm'
import { useMealFoods } from '../hooks/useMealFoods'
import { useMeals } from '../hooks/useMeals'
import type { Meal, MealFood } from '../types'

export function AddMealPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { create } = useMeals(patientId ?? '')

  const [createdMeal, setCreatedMeal] = useState<Meal | null>(null)
  const [foods, setFoods] = useState<MealFood[]>([])
  const [showAddFood, setShowAddFood] = useState(false)
  const [savingMeal, setSavingMeal] = useState(false)

  const { add, remove: removeMealFood } = useMealFoods(createdMeal?.id ?? '')

  async function handleCreateMeal(data: Partial<Meal>) {
    setSavingMeal(true)
    try {
      const meal = await create(data)
      setCreatedMeal(meal)
    } finally {
      setSavingMeal(false)
    }
  }

  async function handleAddFood(foodId: string, grams: number) {
    const mf = await add(foodId, grams)
    setFoods(prev => [...prev, mf])
    setShowAddFood(false)
    setCreatedMeal(prev => prev ? { ...prev, totalCarbs: mf.carbsCalculated + (prev.totalCarbs ?? 0) } : prev)
  }

  async function handleRemoveFood(mealFoodId: string) {
    await removeMealFood(mealFoodId)
    const removed = foods.find(f => f.id === mealFoodId)
    setFoods(prev => prev.filter(f => f.id !== mealFoodId))
    if (removed) {
      setCreatedMeal(prev => prev ? { ...prev, totalCarbs: Math.max(0, prev.totalCarbs - removed.carbsCalculated) } : prev)
    }
  }

  const totalCarbs = foods.reduce((s, mf) => s + mf.carbsCalculated, 0)

  if (!createdMeal) {
    return (
      <AppLayout title="Nueva comida">
        {savingMeal ? <LoadingSpinner /> : (
          <MealForm
            onSubmit={handleCreateMeal}
            onCancel={() => navigate(-1)}
          />
        )}
      </AppLayout>
    )
  }

  return (
    <AppLayout title={createdMeal.name}>
      <div className="flex flex-col gap-4">
        {totalCarbs > 0 && (
          <div className="rounded-2xl bg-blue-600 text-white p-4 text-center">
            <p className="text-4xl font-bold">{totalCarbs.toFixed(1)}g</p>
            <p className="text-sm opacity-80 mt-1">de carbohidratos</p>
          </div>
        )}

        {showAddFood ? (
          <Card>
            <AddFoodToMeal
              onAdd={handleAddFood}
              onCancel={() => setShowAddFood(false)}
            />
          </Card>
        ) : (
          <Button fullWidth onClick={() => setShowAddFood(true)}>
            + Agregar alimento
          </Button>
        )}

        {foods.length > 0 && (
          <Card>
            {foods.map(mf => (
              <MealFoodItem key={mf.id} mealFood={mf} onRemove={handleRemoveFood} />
            ))}
          </Card>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate(`/patients/${patientId}/meals/${createdMeal.id}`)}
        >
          Ver detalle →
        </Button>
      </div>
    </AppLayout>
  )
}
