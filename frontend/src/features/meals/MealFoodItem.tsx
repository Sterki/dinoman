import { useTranslation } from 'react-i18next'
import type { MealFood } from '../../types'

interface Props {
  mealFood: MealFood
  onRemove?: (id: string) => void
}

export function MealFoodItem({ mealFood, onRemove }: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{mealFood.food.name}</p>
        <p className="text-sm text-slate-500">
          {mealFood.gramsConsumed}{t('common.grams')} · {mealFood.food.carbsPer100g}{t('common.carbsOf100g')}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-bold text-blue-600">{mealFood.carbsCalculated.toFixed(1)}g</p>
        <p className="text-xs text-slate-400">{t('common.gCarbs')}</p>
      </div>
      {onRemove && (
        <button onClick={() => onRemove(mealFood.id)} aria-label={t('foods.removeFood')}
          className="size-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50">
          ✕
        </button>
      )}
    </div>
  )
}
