import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import type { Patient } from '../../types'

interface Props {
  patient: Patient
  onDelete?: (id: string) => void
}

export function PatientCard({ patient, onDelete }: Props) {
  return (
    <Card className="flex items-center gap-4">
      <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center text-xl shrink-0">
        {patient.photo ? (
          <img src={patient.photo} alt={patient.name} className="size-full rounded-full object-cover" />
        ) : (
          '👤'
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate">{patient.name}</p>
        <p className="text-sm text-slate-500">
          {patient.age !== null ? `${patient.age} años` : ''}
          {patient.dailyCarbGoal ? ` · Objetivo: ${patient.dailyCarbGoal}g` : ''}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link
          to={`/patients/${patient.id}`}
          className="text-blue-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50"
        >
          Ver
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(patient.id)}
            className="text-red-500 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50"
          >
            Eliminar
          </button>
        )}
      </div>
    </Card>
  )
}
