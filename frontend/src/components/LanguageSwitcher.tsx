import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2) ?? 'es'

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          title={label}
          aria-label={label}
          className={[
            'text-xl leading-none rounded-md p-1 transition-all duration-150',
            current === code
              ? 'opacity-100 scale-110'
              : 'opacity-40 hover:opacity-70',
          ].join(' ')}
        >
          {flag}
        </button>
      ))}
    </div>
  )
}
