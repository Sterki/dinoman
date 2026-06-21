import { useState } from 'react'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import type { Food } from '../../types'

interface Props {
  initial?: Partial<Food>
  onSubmit: (data: Partial<Food>) => Promise<void>
  onCancel?: () => void
}

export function FoodForm({ initial = {}, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial.name ?? '')
  const [carbsPer100g, setCarbsPer100g] = useState(String(initial.carbsPer100g ?? ''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es obligatorio.'); return }
    if (!carbsPer100g || Number(carbsPer100g) < 0) { setError('Los carbohidratos deben ser ≥ 0.'); return }
    setLoading(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), carbsPer100g: Number(carbsPer100g) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}
      <Input
        label="Nombre *"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Ej: Manzana"
        required
      />
      <Input
        label="Carbohidratos por 100g *"
        type="number"
        min="0"
        step="0.01"
        value={carbsPer100g}
        onChange={e => setCarbsPer100g(e.target.value)}
        placeholder="Ej: 14"
        required
      />
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancelar</Button>
        )}
        <Button type="submit" fullWidth loading={loading}>Guardar</Button>
      </div>
    </form>
  )
}
