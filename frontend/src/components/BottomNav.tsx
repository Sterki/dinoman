import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/',         icon: '🏠', label: 'Inicio' },
  { to: '/meals',    icon: '🍽️', label: 'Comidas' },
  { to: '/foods',    icon: '🥗', label: 'Alimentos' },
  { to: '/patients', icon: '👤', label: 'Pacientes' },
] as const

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 safe-area-bottom">
      <ul className="flex h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => [
                'flex flex-col items-center justify-center h-full gap-0.5',
                'text-xs font-medium transition-colors duration-150',
                isActive ? 'text-blue-600' : 'text-slate-500',
              ].join(' ')}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
