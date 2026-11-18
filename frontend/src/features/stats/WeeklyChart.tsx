import type { DailyDataPoint } from '../../types'

interface Props {
  data: DailyDataPoint[]
  goal?: number | null
}

function shortDay(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' })
}

export function WeeklyChart({ data, goal }: Props) {
  if (data.length === 0) return null

  const maxVal = Math.max(...data.map(d => d.totalCarbs), goal ?? 0, 1)
  const chartH = 100

  return (
    <div className="mt-2">
      <div className="flex items-end gap-1 h-28">
        {data.map((d, i) => {
          const h = Math.round((d.totalCarbs / maxVal) * chartH)
          const isOver = goal ? d.totalCarbs > goal : false
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
              <span className="text-xs text-slate-500 leading-none">{d.totalCarbs > 0 ? d.totalCarbs.toFixed(0) : ''}</span>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${isOver ? 'bg-red-400' : 'bg-blue-500'}`}
                style={{ height: `${h}%`, minHeight: d.totalCarbs > 0 ? '4px' : 0 }}
              />
            </div>
          )
        })}
      </div>
      {goal && (
        <div
          className="border-t-2 border-dashed border-orange-400 -mt-1 relative"
          style={{ marginTop: `-${Math.round((goal / maxVal) * chartH)}%` }}
        />
      )}
      <div className="flex gap-1 mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-xs text-slate-400">{shortDay(d.date)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
