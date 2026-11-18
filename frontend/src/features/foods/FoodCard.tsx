import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/Card'
import type { Food } from '../../types'

interface Props {
  food: Food
  onEdit?: (food: Food) => void
  onDelete?: (id: string) => void
}

export function FoodCard({ food, onEdit, onDelete }: Props) {
  const { t } = useTranslation()
  const [imgError, setImgError] = useState(false)
  const showPhoto = !!food.photo && !imgError

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        {showPhoto ? (
          <img
            src={food.photo!}
            alt={food.name}
            className="size-10 rounded-xl object-cover shrink-0 bg-slate-100"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0 text-lg">🥗</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{food.name}</p>
          <p className="text-sm text-slate-500">{food.carbsPer100g}{t('common.carbsOf100g')}</p>
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex border-t border-slate-100 divide-x divide-slate-100">
          {onEdit && <button onClick={() => onEdit(food)} className="flex-1 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50">{t('common.edit')}</button>}
          {onDelete && <button onClick={() => onDelete(food.id)} className="flex-1 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50">{t('common.delete')}</button>}
        </div>
      )}
    </Card>
  )
}
