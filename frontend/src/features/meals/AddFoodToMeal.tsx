import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useFoods } from '../../hooks/useFoods'
import type { Food } from '../../types'

interface Props {
  onAdd: (foodId: string, grams: number) => Promise<void>
  onCancel: () => void
}

export function AddFoodToMeal({ onAdd, onCancel }: Props) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [grams, setGrams] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { foods } = useFoods(debouncedSearch)

  const carbsPreview = useMemo(() => {
    if (!selectedFood || !grams) return null
    return ((selectedFood.carbsPer100g / 100) * Number(grams)).toFixed(1)
  }, [selectedFood, grams])

  async function handleAdd() {
    if (!selectedFood) { setError('Selecciona un alimento.'); return }
    if (!grams || Number(grams) <= 0) { setError('Indica los gramos consumidos.'); return }
    setLoading(true)
    setError(null)
    try {
      await onAdd(selectedFood.id, Number(grams))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al agregar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      {!selectedFood ? (
        <>
          <Input
            label="Buscar alimento"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ej: manzana…"
            autoFocus
          />
          <ul className="flex flex-col gap-1 max-h-60 overflow-y-auto">
            {foods.map(food => (
              <li key={food.id}>
                <button
                  onClick={() => setSelectedFood(food)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left hover:bg-blue-50 transition-colors"
                >
                  <span className="font-medium text-slate-800">{food.name}</span>
                  <span className="text-sm text-slate-500">{food.carbsPer100g}g/100g</span>
                </button>
              </li>
            ))}
            {foods.length === 0 && (
              <p className="text-center text-slate-400 py-6 text-sm">Sin resultados</p>
            )}
          </ul>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <div className="flex-1">
              <p className="font-semibold text-blue-900">{selectedFood.name}</p>
              <p className="text-sm text-blue-600">{selectedFood.carbsPer100g}g carb. / 100g</p>
            </div>
            <button
              onClick={() => { setSelectedFood(null); setGrams('') }}
              className="text-blue-400 hover:text-blue-600 text-lg"
            >
              ✕
            </button>
          </div>

          <Input
            label="Gramos consumidos"
            type="number"
            min="0.1"
            step="0.1"
            value={grams}
            onChange={e => setGrams(e.target.value)}
            placeholder="Ej: 120"
            autoFocus
          />

          {carbsPreview !== null && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{carbsPreview}g</p>
              <p className="text-sm text-green-600 mt-1">de carbohidratos</p>
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancelar</Button>
        {selectedFood && (
          <Button type="button" fullWidth loading={loading} onClick={handleAdd}>
            Agregar
          </Button>
        )}
      </div>
    </div>
  )
}
