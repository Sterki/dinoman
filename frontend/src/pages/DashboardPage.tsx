import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { FloatingActionButton } from '../components/FloatingActionButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { DailySummary } from '../features/dashboard/DailySummary'
import { RecentMeals } from '../features/dashboard/RecentMeals'
import { useMeals, useTodaySummary } from '../hooks/useMeals'
import { usePatients } from '../hooks/usePatients'

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { patients, loading: pLoading } = usePatients()
  const [selectedIdx, setSelectedIdx] = useState(0)

  const patient = patients[selectedIdx] ?? null
  const { summary, loading: sLoading } = useTodaySummary(patient?.id ?? '')
  const { meals, loading: mLoading } = useMeals(patient?.id ?? '', 'today')
  const loading = sLoading || mLoading

  if (pLoading) return <AppLayout title={t('dashboard.title')}><LoadingSpinner /></AppLayout>

  if (patients.length === 0) {
    return (
      <AppLayout title={t('dashboard.title')}>
        <EmptyState
          icon="👤"
          title={t('patients.noPatients')}
          description={t('patients.noPatientsDesc')}
          action={
            <Button onClick={() => navigate('/patients', { state: { showForm: true } })}>
              {t('patients.createPatient')}
            </Button>
          }
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={t('dashboard.title')}
      headerRight={
        patients.length > 1 ? (
          <select value={selectedIdx} onChange={e => setSelectedIdx(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1">
            {patients.map((p, i) => <option key={p.id} value={i}>{p.name}</option>)}
          </select>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        {loading ? <LoadingSpinner /> : (
          <>
            {summary
              ? <DailySummary summary={summary} patientName={patient!.name} />
              : <Card><p className="text-slate-500 text-sm text-center py-4">{t('dashboard.noDataToday')}</p></Card>
            }
            <RecentMeals meals={meals} patientId={patient!.id} />
            <Button variant="secondary" fullWidth onClick={() => navigate(`/patients/${patient!.id}`)}>
              {t('patients.viewHistory')}
            </Button>
          </>
        )}
      </div>
      <FloatingActionButton onClick={() => navigate(`/patients/${patient!.id}/meals/new`)} label={t('meals.addMeal')} />
    </AppLayout>
  )
}
