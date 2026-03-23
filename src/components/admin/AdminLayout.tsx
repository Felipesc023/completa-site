import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, LayoutGrid, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

const NAV = [
  { label: 'Dashboard',  to: '/admin',          icon: LayoutDashboard, end: true },
  { label: 'Produtos',   to: '/admin/produtos',  icon: Package },
  { label: 'Pedidos',    to: '/admin/pedidos',   icon: ShoppingBag },
  { label: 'Vitrines',   to: '/admin/vitrines',  icon: LayoutGrid },
]

export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-56 bg-neutral-900 flex flex-col">
        <div className="px-6 py-5 border-b border-neutral-800">
          <span className="font-display text-lg text-white tracking-widest">COMPLETA</span>
          <p className="text-2xs text-neutral-500 mt-0.5 uppercase tracking-widest">Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-neutral-400 hover:text-white rounded transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
