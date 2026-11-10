import { NavLink } from 'react-router-dom'

const itens = [
  { to: '/', label: 'Painel', icon: PainelIcon, fim: true },
  { to: '/vendas', label: 'Vendas', icon: VendasIcon },
  { to: '/estoque', label: 'Estoque', icon: EstoqueIcon },
  { to: '/caixa', label: 'Caixa', icon: CaixaIcon },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-(--color-surface) border-t border-(--color-border) pb-[env(safe-area-inset-bottom)] z-20">
      <ul className="flex justify-around">
        {itens.map(({ to, label, icon: Icon, fim }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={fim}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-(--color-accent)'
                    : 'text-(--color-text-faint)'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon ativo={isActive} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function PainelIcon({ ativo }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function VendasIcon({ ativo }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 4H5L6.4 14.2C6.55 15.24 7.44 16 8.5 16H17.5C18.53 16 19.4 15.28 19.58 14.27L21 6H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="20" r="1.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function EstoqueIcon({ ativo }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="14" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 7L12 3L21 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 11.5H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CaixaIcon({ ativo }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="6" width="19" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 9.5H21.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
