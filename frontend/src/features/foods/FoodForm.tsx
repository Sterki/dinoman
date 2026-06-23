import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import type { Food } from '../../types'

interface Props {
  initial?: Partial<Food>
  onSubmit: (data: Partial<Food>) => Promise<void>
  onCancel?: () => void
}

export function FoodForm({ initial = {}, onSubmit, onCancel }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial.name ?? '')
  const [carbsPer100g, setCarbsPer100g] = useState(String(initial.carbsPer100g ?? ''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError(t('errors.nameRequired')); return }
    if (!carbsPer100g || Number(carbsPer100g) < 0) { setError(t('errors.carbsGe0')); return }
    setLoading(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), carbsPer100g: Number(carbsPer100g) })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.savingError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      <Input label={`${t('foods.name')} ${t('common.required')}`} value={name} onChange={e => setName(e.target.value)} placeholder={t('foods.namePlaceholder')} required />
      <Input label={`${t('foods.carbsPer100g')} ${t('common.required')}`} type="number" min="0" step="0.01" value={carbsPer100g} onChange={e => setCarbsPer100g(e.target.value)} placeholder={t('foods.carbsPer100gPlaceholder')} required />
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" fullWidth onClick={onCancel}>{t('common.cancel')}</Button>}
        <Button type="submit" fullWidth loading={loading}>{t('common.save')}</Button>
      </div>
    </form>
  )
}
