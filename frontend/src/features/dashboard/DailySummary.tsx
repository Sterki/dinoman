import { useTranslation } from 'react-i18next'
import { Card } from '../../components/Card'
import type { TodaySummary } from '../../types'

interface Props {
  summary: TodaySummary
  patientName: string
}

export function DailySummary({ summary, patientName }: Props) {
  const { t } = useTranslation()
  const goal = summary.dailyCarbGoal
  const pct = goal ? Math.min(100, Math.round((summary.totalCarbs / goal) * 100)) : null
  const isOver = goal ? summary.totalCarbs > goal : false

  return (
    <Card>
      <p className="text-sm font-medium text-slate-500 mb-1">{patientName} · {t('dashboard.todayOf')}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-4xl font-bold ${isOver ? 'text-red-600' : 'text-blue-600'}`}>
            {summary.totalCarbs.toFixed(1)}
            <span className="text-lg font-normal text-slate-400 ml-1">g</span>
          </p>
          <p className="text-sm text-slate-500 mt-0.5">{t('meals.carbsConsumed')}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-700">{summary.mealCount}</p>
          <p className="text-xs text-slate-400">{t('meals.mealsCount')}</p>
        </div>
      </div>
      {goal && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{t('patients.goal')}: {goal}g</span>
            <span className={isOver ? 'text-red-600 font-medium' : ''}>{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </Card>
  )
}
