import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/Button'
import { Input, TextArea } from '../../components/Input'
import type { Meal } from '../../types'

function toLocalDateTimeString(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface Props {
  initial?: Partial<Meal>
  onSubmit: (data: Partial<Meal>) => Promise<void>
  onCancel?: () => void
}

export function MealForm({ initial = {}, onSubmit, onCancel }: Props) {
  const { t } = useTranslation()

  const MEAL_NAMES = [
    t('meals.breakfast'),
    t('meals.lunch'),
    t('meals.dinner'),
    t('meals.snack'),
    t('meals.snack2'),
  ]

  const [name, setName] = useState(initial.name ?? '')
  const [eatenAt, setEatenAt] = useState(
    initial.eatenAt ? toLocalDateTimeString(new Date(initial.eatenAt)) : toLocalDateTimeString()
  )
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError(t('errors.mealNameRequired')); return }
    setLoading(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), eatenAt: new Date(eatenAt).toISOString(), notes: notes.trim() || null })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.savingError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {MEAL_NAMES.map(n => (
          <button key={n} type="button" onClick={() => setName(n)}
            className={['px-4 py-2 rounded-full text-sm font-medium border transition-colors', name === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'].join(' ')}>
            {n}
          </button>
        ))}
      </div>

      <Input label={`${t('meals.name')} ${t('common.required')}`} value={name} onChange={e => setName(e.target.value)} placeholder={t('meals.namePlaceholder')} required />
      <Input label={t('meals.dateTime')} type="datetime-local" value={eatenAt} onChange={e => setEatenAt(e.target.value)} />
      <TextArea label={t('meals.notes')} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('meals.notesPlaceholder')} rows={2} />

      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" fullWidth onClick={onCancel}>{t('common.cancel')}</Button>}
        <Button type="submit" fullWidth loading={loading}>{t('common.save')}</Button>
      </div>
    </form>
  )
}
