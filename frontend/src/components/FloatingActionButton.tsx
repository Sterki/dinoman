interface Props {
  onClick: () => void
  label?: string
  icon?: string
}

export function FloatingActionButton({ onClick, label = 'Agregar', icon = '+' }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={[
        'fixed bottom-24 right-4 z-40',
        'size-14 rounded-full bg-blue-600 text-white shadow-lg',
        'flex items-center justify-center text-2xl font-bold',
        'hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
      ].join(' ')}
    >
      {icon}
    </button>
  )
}
