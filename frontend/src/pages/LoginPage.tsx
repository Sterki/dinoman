import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useAuth } from '../context/AuthContext'

type Tab = 'login' | 'register'

export function LoginPage() {
  const { t } = useTranslation()
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
      setError(t('auth.passwordMismatch'))
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
      setError(err instanceof Error ? err.message : t('auth.unexpectedError'))
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
      {/* Language switcher top-right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">💙</div>
        <h1 className="text-3xl font-bold text-white">GlucoTrack</h1>
        <p className="text-blue-200 text-sm mt-1">{t('auth.appTagline')}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['login', 'register'] as Tab[]).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => switchTab(tabKey)}
              className={[
                'flex-1 py-4 text-sm font-semibold transition-colors',
                tab === tabKey
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              {tabKey === 'login' ? t('auth.login') : t('auth.register')}
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
            label={t('auth.email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            required
          />

          <Input
            label={t('auth.password')}
            type="password"
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            required
          />

          {tab === 'register' && (
            <Input
              label={t('auth.confirmPassword')}
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              required
            />
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            {tab === 'login' ? t('auth.enter') : t('auth.createAccount')}
          </Button>
        </form>
      </div>

      <p className="text-blue-300 text-xs mt-6 text-center max-w-xs">
        {t('auth.privacyNote')}
      </p>
    </div>
  )
}
