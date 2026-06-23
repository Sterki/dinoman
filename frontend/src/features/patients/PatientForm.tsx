import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import type { Patient } from '../../types'

interface Props {
  initial?: Partial<Patient>
  onSubmit: (data: Partial<Patient>) => Promise<void>
  onCancel?: () => void
}

export function PatientForm({ initial = {}, onSubmit, onCancel }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial.name ?? '')
  const [birthDate, setBirthDate] = useState(initial.birthDate ?? '')
  const [dailyCarbGoal, setDailyCarbGoal] = useState(String(initial.dailyCarbGoal ?? ''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError(t('errors.nameRequired')); return }
    setLoading(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        birthDate: birthDate || null,
        dailyCarbGoal: dailyCarbGoal ? Number(dailyCarbGoal) : null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.savingError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}
      <Input label={`${t('patients.name')} ${t('common.required')}`} value={name} onChange={e => setName(e.target.value)} placeholder={t('patients.namePlaceholder')} required />
      <Input label={t('patients.birthDate')} type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
      <Input label={t('patients.dailyCarbGoal')} type="number" min="0" step="0.1" value={dailyCarbGoal} onChange={e => setDailyCarbGoal(e.target.value)} placeholder={t('patients.dailyCarbGoalPlaceholder')} />
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" fullWidth onClick={onCancel}>{t('common.cancel')}</Button>}
        <Button type="submit" fullWidth loading={loading}>{t('common.save')}</Button>
      </div>
    </form>
  )
}
