import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { WeeklyChart } from '../features/stats/WeeklyChart'
import { usePatients } from '../hooks/usePatients'
import { useStats } from '../hooks/useStats'

export function StatsPage() {
  const { t } = useTranslation()
  const { patientId } = useParams<{ patientId: string }>()
  const { patients, loading: pLoading } = usePatients()
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')

  const patient = patients.find(p => p.id === patientId)
  const { stats, loading: sLoading } = useStats(patientId ?? '', period)

  if (pLoading || sLoading) return <AppLayout title={t('stats.title')}><LoadingSpinner /></AppLayout>
  if (!patient) return <AppLayout title={t('stats.title')}><EmptyState icon="❌" title={t('patients.notFound')} /></AppLayout>

  return (
    <AppLayout title={`${t('stats.title')} · ${patient.name}`}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(['7d', '30d'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={['flex-1 py-2 rounded-lg text-sm font-medium transition-colors', period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'].join(' ')}>
              {p === '7d' ? t('stats.last7days') : t('stats.last30days')}
            </button>
          ))}
        </div>

        {stats && stats.dailyData.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.avgCarbs.toFixed(0)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('stats.avgPerDay')}</p>
              </Card>
              <Card className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.maxDay?.totalCarbs.toFixed(0) ?? '—'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('stats.maxDay')}</p>
              </Card>
              <Card className="text-center">
                <p className="text-2xl font-bold text-orange-500">{stats.minDay?.totalCarbs.toFixed(0) ?? '—'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t('stats.minDay')}</p>
              </Card>
            </div>
            <Card>
              <h3 className="font-semibold text-slate-700 mb-1 text-sm">{t('stats.evolution')}</h3>
              <WeeklyChart data={stats.dailyData} goal={patient.dailyCarbGoal} />
            </Card>
          </>
        ) : (
          <EmptyState icon="📊" title={t('stats.noData')} description={t('stats.noDataDesc')} />
        )}
      </div>
    </AppLayout>
  )
}
