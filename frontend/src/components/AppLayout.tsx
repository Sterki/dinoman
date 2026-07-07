import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { BottomNav } from './BottomNav'
import { LanguageSwitcher } from './LanguageSwitcher'

interface Props {
  children: ReactNode
  title?: string
  headerRight?: ReactNode
}

export function AppLayout({ children, title, headerRight }: Props) {
  const { t } = useTranslation()
  const { logout, user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex flex-col min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-slate-900 truncate flex-1">
          {title ?? 'GlucoTrack'}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          {headerRight}

          <LanguageSwitcher />

          {/* User avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="size-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center hover:bg-blue-200 transition-colors"
              aria-label={t('auth.userMenu')}
            >
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-10 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-2 min-w-44">
                  <p className="px-4 py-2 text-xs text-slate-400 truncate border-b border-slate-100">
                    {user?.email}
                  </p>
                  <button
                    onClick={() => { setShowMenu(false); logout() }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    {t('auth.logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
