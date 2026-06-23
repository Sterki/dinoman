import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import type { Meal } from '../../types'

interface Props {
  meals: Meal[]
  patientId: string
}

export function RecentMeals({ meals, patientId }: Props) {
  const { t } = useTranslation()
  const recent = meals.slice(0, 3)
  if (recent.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">{t('dashboard.recentMeals')}</h2>
      <div className="flex flex-col gap-2">
        {recent.map(meal => (
          <Link key={meal.id} to={`/patients/${patientId}/meals/${meal.id}`}>
            <Card className="flex items-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{meal.name}</p>
                <p className="text-sm text-slate-500">
                  {new Date(meal.eatenAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className="font-bold text-blue-600 shrink-0">{meal.totalCarbs.toFixed(1)}g</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
