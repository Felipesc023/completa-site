import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, Search, Menu, X, User } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

const NAV_LINKS = [
  { label: 'Novidades',   to: '/loja?sort=newest' },
  { label: 'Coleções',    to: '/loja' },
  { label: 'Sale',        to: '/loja?promo=true' },
  { label: 'Contato',     to: '/contato' },
]

export function Header() {
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')

  const totalItems = useCartStore((s) => s.totalItems())
  const openCart   = useCartStore((s) => s.openCart)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Header com fundo ao rolar
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/loja?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-sm border-b border-neutral-100 shadow-soft'
            : 'bg-white border-b border-neutral-100'
        )}
      >
        {/* Barra de anúncio */}
        <div className="bg-neutral-900 text-white text-center py-2 text-xs tracking-widest font-sans">
          FRETE GRÁTIS PARA TODO O BRASIL NAS COMPRAS ACIMA DE R$ 299
        </div>

        <div className="container-loja">
          <div className="flex items-center justify-between h-16">

            {/* Menu mobile */}
            <button
              className="lg:hidden btn-ghost p-2"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="font-display text-2xl font-light tracking-[0.2em] text-neutral-900 hover:text-brand-500 transition-colors"
            >
              COMPLETA
            </Link>

            {/* Navegação desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    clsx(
                      'text-xs uppercase tracking-widest font-sans transition-colors duration-200',
                      isActive
                        ? 'text-neutral-900 border-b border-neutral-900 pb-0.5'
                        : 'text-neutral-500 hover:text-neutral-900'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Ações */}
            <div className="flex items-center gap-1">
              {user && (
                <Link
                  to="/minha-conta/pedidos"
                  className="hidden lg:flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors mr-2"
                >
                  Meus pedidos
                </Link>
              )}
              {/* Busca */}
              <button
                className="btn-ghost p-2.5"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Buscar"
              >
                <Search size={18} />
              </button>

              {/* Usuário / Admin */}
              {user ? (
                <div className="relative group">
                  <button className="btn-ghost p-2.5" aria-label="Minha conta">
                    <User size={18} />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-100 shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 border-b border-neutral-50">
                      <p className="text-xs font-medium text-neutral-800 truncate">{user.name || user.email}</p>
                      <p className="text-2xs text-neutral-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/minha-conta/pedidos" className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
                      Meus pedidos
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
                        Painel admin
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn-ghost p-2.5" aria-label="Entrar">
                  <User size={18} />
                </Link>
              )}

              {/* Wishlist */}
              <Link to="/wishlist" className="btn-ghost p-2.5" aria-label="Lista de desejos">
                <Heart size={18} />
              </Link>

              {/* Carrinho */}
              <button
                className="btn-ghost p-2.5 relative"
                onClick={() => openCart()}
                aria-label={`Sacola — ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span className="badge absolute -top-0.5 -right-0.5 text-2xs">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Barra de busca expandível */}
          {searchOpen && (
            <div className="border-t border-neutral-100 py-3 animate-slide-up">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={16} className="text-neutral-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                  className="text-neutral-400 hover:text-neutral-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Espaçador para o header fixo (barra de anúncio + header) */}
      <div className="h-[calc(4rem+2rem)]" />

      {/* Menu mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <span className="font-display text-xl tracking-widest">COMPLETA</span>
              <button onClick={() => setMenuOpen(false)} className="btn-ghost p-1">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col p-5 gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => clsx(
                    'py-3 px-2 text-sm uppercase tracking-widest border-b border-neutral-50 transition-colors',
                    isActive ? 'text-neutral-900 font-medium' : 'text-neutral-500'
                  )}
                >{link.label}</NavLink>
              ))}
              {user ? (
                <Link to="/minha-conta/pedidos" onClick={() => setMenuOpen(false)}
                  className="py-3 px-2 text-sm uppercase tracking-widest border-b border-neutral-50 text-neutral-500">
                  Meus pedidos
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="py-3 px-2 text-sm uppercase tracking-widest border-b border-neutral-50 text-neutral-500">
                  Entrar / Criar conta
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
