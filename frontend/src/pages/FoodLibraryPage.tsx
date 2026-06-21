import { useEffect, useState } from 'react'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { Input } from '../components/Input'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { FoodCard } from '../features/foods/FoodCard'
import { FoodForm } from '../features/foods/FoodForm'
import { useFoods } from '../hooks/useFoods'
import type { Food } from '../types'

export function FoodLibraryPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { foods, loading, create, update, remove } = useFoods(debouncedSearch)

  async function handleSubmit(data: Partial<Food>) {
    if (editingFood) {
      await update(editingFood.id, data)
      setEditingFood(null)
    } else {
      await create(data)
      setShowForm(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este alimento del catálogo?')) return
    await remove(id)
  }

  const isFormVisible = showForm || editingFood !== null

  return (
    <AppLayout title="Alimentos">
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Buscar alimento…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {isFormVisible && (
          <Card>
            <h2 className="font-semibold text-slate-800 mb-4">
              {editingFood ? 'Editar alimento' : 'Nuevo alimento'}
            </h2>
            <FoodForm
              initial={editingFood ?? {}}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingFood(null) }}
            />
          </Card>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : foods.length === 0 ? (
          <EmptyState
            icon="🥗"
            title="Sin alimentos"
            description="Agrega alimentos al catálogo para reutilizarlos en tus comidas."
            action={
              !isFormVisible ? (
                <Button onClick={() => setShowForm(true)}>Agregar alimento</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {foods.map(food => (
              <FoodCard
                key={food.id}
                food={food}
                onEdit={setEditingFood}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {!isFormVisible && (
        <FloatingActionButton onClick={() => setShowForm(true)} label="Agregar alimento" />
      )}
    </AppLayout>
  )
}
