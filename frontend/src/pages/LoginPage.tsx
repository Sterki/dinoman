import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useAuth } from '../context/AuthContext'

type Tab = 'login' | 'register'

export function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (tab === 'register' && password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  function switchTab(t: Tab) {
    setTab(t)
    setError(null)
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo / heading */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">💙</div>
        <h1 className="text-3xl font-bold text-white">GlucoTrack</h1>
        <p className="text-blue-200 text-sm mt-1">Gestión de carbohidratos para familias</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={[
                'flex-1 py-4 text-sm font-semibold transition-colors',
                tab === t
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
          />

          {tab === 'register' && (
            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            {tab === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>
      </div>

      <p className="text-blue-300 text-xs mt-6 text-center max-w-xs">
        Tus datos son privados y solo tú puedes verlos.
      </p>
    </div>
  )
}
