import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { WeeklyChart } from '../features/stats/WeeklyChart'
import { usePatients } from '../hooks/usePatients'
import { useStats } from '../hooks/useStats'

export function StatsPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { patients, loading: pLoading } = usePatients()
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')

  const patient = patients.find(p => p.id === patientId)
  const { stats, loading: sLoading } = useStats(patientId ?? '', period)

  if (pLoading || sLoading) return <AppLayout title="Estadísticas"><LoadingSpinner /></AppLayout>

  if (!patient) return <AppLayout title="Estadísticas"><EmptyState icon="❌" title="Paciente no encontrado" /></AppLayout>

  return (
    <AppLayout title={`Stats · ${patient.name}`}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(['7d', '30d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500',
              ].join(' ')}
            >
              {p === '7d' ? 'Últimos 7 días' : 'Últimos 30 días'}
            </button>
          ))}
        </div>

        {stats && stats.dailyData.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.avgCarbs.toFixed(0)}</p>
                <p className="text-xs text-slate-500 mt-0.5">Promedio/día</p>
              </Card>
              <Card className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.maxDay?.totalCarbs.toFixed(0) ?? '—'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Día máximo</p>
              </Card>
              <Card className="text-center">
                <p className="text-2xl font-bold text-orange-500">
                  {stats.minDay?.totalCarbs.toFixed(0) ?? '—'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Día mínimo</p>
              </Card>
            </div>

            <Card>
              <h3 className="font-semibold text-slate-700 mb-1 text-sm">Evolución</h3>
              <WeeklyChart data={stats.dailyData} goal={patient.dailyCarbGoal} />
            </Card>
          </>
        ) : (
          <EmptyState icon="📊" title="Sin datos" description="No hay comidas registradas en este período." />
        )}
      </div>
    </AppLayout>
  )
}
