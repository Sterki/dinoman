import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import type { Meal } from '../../types'

interface Props {
  meal: Meal
  patientId: string
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onToggleFavorite?: (id: string, current: boolean) => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function MealCard({ meal, patientId, onDelete, onDuplicate, onToggleFavorite }: Props) {
  return (
    <Card padding={false} className="overflow-hidden">
      <Link to={`/patients/${patientId}/meals/${meal.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 truncate">{meal.name}</p>
              {meal.isFavorite && <span className="text-yellow-500 text-sm">★</span>}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{formatTime(meal.eatenAt)}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xl font-bold text-blue-600">{meal.totalCarbs.toFixed(1)}</p>
            <p className="text-xs text-slate-400">g carb.</p>
          </div>
        </div>
        {meal.foods.length > 0 && (
          <p className="text-xs text-slate-500 mt-2 truncate">
            {meal.foods.map(mf => mf.food.name).join(', ')}
          </p>
        )}
      </Link>
      {(onDelete || onDuplicate || onToggleFavorite) && (
        <div className="flex border-t border-slate-100 divide-x divide-slate-100">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(meal.id, meal.isFavorite)}
              className="flex-1 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              {meal.isFavorite ? '★ Quitar' : '☆ Favorita'}
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(meal.id)}
              className="flex-1 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
            >
              Duplicar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(meal.id)}
              className="flex-1 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </Card>
  )
}
