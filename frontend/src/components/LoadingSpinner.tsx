import { useTranslation } from 'react-i18next'

interface Props {
  message?: string
}

export function LoadingSpinner({ message }: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <span className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm">{message ?? t('common.loading')}</p>
    </div>
  )
}
