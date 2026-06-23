import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { EmptyState } from '../components/EmptyState'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MealCard } from '../features/meals/MealCard'
import { useMeals } from '../hooks/useMeals'
import { usePatients } from '../hooks/usePatients'

type Period = 'today' | '7d' | '30d' | 'all'

export function MealsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { patients, loading: pLoading } = usePatients()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [period, setPeriod] = useState<Period>('today')

  const PERIODS: { value: Period; label: string }[] = [
    { value: 'today', label: t('meals.today') },
    { value: '7d',    label: t('meals.last7') },
    { value: '30d',   label: t('meals.last30') },
    { value: 'all',   label: t('meals.all') },
  ]

  const patient = patients[selectedIdx] ?? null
  const { meals, loading: mLoading, remove, update, duplicate } = useMeals(patient?.id ?? '', period)

  async function handleDelete(id: string) {
    if (!confirm(t('meals.deleteConfirm'))) return
    await remove(id)
  }
  async function handleToggleFavorite(id: string, current: boolean) { await update(id, { isFavorite: !current }) }
  async function handleDuplicate(id: string) { await duplicate(id) }

  if (pLoading) return <AppLayout title={t('meals.title')}><LoadingSpinner /></AppLayout>

  if (patients.length === 0) {
    return (
      <AppLayout title={t('meals.title')}>
        <EmptyState icon="👤" title={t('patients.noPatients')} description={t('patients.noPatientsDesc')} />
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={t('meals.title')}
      headerRight={
        patients.length > 1 ? (
          <select value={selectedIdx} onChange={e => setSelectedIdx(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white">
            {patients.map((p, i) => <option key={p.id} value={i}>{p.name}</option>)}
          </select>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {PERIODS.map(({ value, label }) => (
            <button key={value} onClick={() => setPeriod(value)}
              className={['flex-1 py-2 rounded-lg text-sm font-medium transition-colors', period === value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'].join(' ')}>
              {label}
            </button>
          ))}
        </div>

        {mLoading ? <LoadingSpinner /> : meals.length === 0 ? (
          <EmptyState icon="🍽️" title={t('meals.noMeals')} description={t('meals.noMealsDesc')} />
        ) : (
          <div className="flex flex-col gap-3">
            {meals.map(meal => (
              <MealCard key={meal.id} meal={meal} patientId={patient!.id}
                onDelete={handleDelete} onDuplicate={handleDuplicate} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        )}
      </div>
      <FloatingActionButton onClick={() => navigate(`/patients/${patient!.id}/meals/new`)} label={t('meals.addMeal')} />
    </AppLayout>
  )
}
