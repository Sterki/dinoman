import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { PatientCard } from '../features/patients/PatientCard'
import { PatientForm } from '../features/patients/PatientForm'
import { usePatients } from '../hooks/usePatients'
import type { Patient } from '../types'

export function PatientsPage() {
  const { patients, loading, create, remove } = usePatients()
  const location = useLocation()
  const [showForm, setShowForm] = useState((location.state as { showForm?: boolean } | null)?.showForm === true)

  async function handleCreate(data: Partial<Patient>) {
    await create(data)
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este paciente y todas sus comidas?')) return
    await remove(id)
  }

  return (
    <AppLayout
      title="Pacientes"
      headerRight={
        !showForm ? (
          <Button size="sm" onClick={() => setShowForm(true)}>+ Nuevo</Button>
        ) : undefined
      }
    >
      {showForm && (
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-4">Nuevo paciente</h2>
          <PatientForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : patients.length === 0 ? (
        <EmptyState
          icon="👤"
          title="Sin pacientes"
          description="Agrega el primero para empezar a registrar comidas."
          action={!showForm ? <Button onClick={() => setShowForm(true)}>Crear paciente</Button> : undefined}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {patients.map(p => (
            <PatientCard key={p.id} patient={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
