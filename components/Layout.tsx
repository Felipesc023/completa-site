import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Instagram, MessageCircle, Heart, Search, ChevronDown, ChevronRight, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants';

export const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setIsMenuOpen(false);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20 relative">
            
            <div className="flex items-center lg:hidden z-20">
              <button 
                onClick={() => { setIsMenuOpen(!isMenuOpen); setIsSearchOpen(false); }} 
                className="text-brand-dark p-2 -ml-2 hover:text-brand-gold transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0 lg:flex-shrink-0 flex flex-col items-center cursor-pointer lg:mr-8 z-10" 
              onClick={() => navigate('/')}
            >
              <h1 className="font-script text-3xl md:text-4xl text-brand-dark leading-none whitespace-nowrap">Completa</h1>
              <span className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase text-brand-warmgrey mt-1 font-sans">
                Moda Feminina
              </span>
            </div>

            <div className="hidden lg:flex space-x-6 xl:space-x-8 items-center flex-grow justify-center">
              <Link to="/" className="text-sm uppercase tracking-widest hover:text-brand-gold transition-colors">Home</Link>
              <div className="relative group h-20 flex items-center">
                <div className="text-sm uppercase tracking-widest hover:text-brand-gold transition-colors flex items-center gap-1 py-2 cursor-default">
                  Categorias <ChevronDown size={14} />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white shadow-lg border-t-2 border-brand-gold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="py-2">
                    {CATEGORIES.map(cat => (
                      <Link key={cat.id} to={`/shop?category=${cat.name}`} className="block px-4 py-2 text-xs uppercase tracking-widest text-brand-dark hover:bg-stone-50 hover:text-brand-gold">{cat.name}</Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link to="/contact" className="text-sm uppercase tracking-widest hover:text-brand-gold transition-colors">Contato</Link>
            </div>

            <div className="flex items-center justify-end gap-3 md:gap-5 z-20">
              <button onClick={() => { setIsSearchOpen(!isSearchOpen); setIsMenuOpen(false); }} className="text-brand-dark hover:text-brand-gold p-1">
                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>

              <div className="relative group cursor-pointer">
                 <UserIcon size={20} className="text-brand-dark group-hover:text-brand-gold transition-colors" />
                 <div className="absolute top-full right-0 w-48 bg-white shadow-lg border-t-2 border-brand-gold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-2 z-50">
                    {user ? (
                        <div className="py-2">
                            <div className="px-4 py-2 text-xs text-stone-500 border-b border-stone-100 mb-1">Olá, {user.name}</div>
                            {isAdmin && <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-brand-dark hover:bg-stone-50">Painel Admin</Link>}
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-stone-50">Sair</button>
                        </div>
                    ) : (
                        <div className="py-2">
                            <Link to="/login" className="block px-4 py-2 text-sm text-brand-dark hover:bg-stone-50">Entrar</Link>
                        </div>
                    )}
                 </div>
              </div>

              <Link to="/wishlist" className="relative cursor-pointer group p-1">
                <Heart size={20} className="text-brand-dark group-hover:text-brand-gold transition-colors" />
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{wishlistCount}</span>}
              </Link>

              <Link to="/cart" className="relative cursor-pointer group p-1">
                <ShoppingBag size={20} className="text-brand-dark group-hover:text-brand-gold transition-colors" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-stone-100 p-4 shadow-sm z-40 animate-fade-in">
             <form onSubmit={handleSearch} className="flex items-center bg-stone-50 rounded-sm px-3 py-3 max-w-2xl mx-auto border border-stone-200">
                <input type="text" placeholder="O que você procura?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent w-full text-sm outline-none text-brand-dark placeholder-stone-400" autoFocus />
                <button type="submit" className="text-brand-gold hover:text-brand-dark"><Search size={18} /></button>
             </form>
          </div>
        )}
      </nav>

      <main className="flex-grow"><Outlet /></main>

      <footer className="bg-brand-dark text-brand-beige py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center md:items-start">
              <h2 className="font-script text-3xl mb-4">Completa</h2>
              <p className="text-sm font-light text-stone-400">Moda que inspira elegância.</p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest mb-4 text-brand-gold">Loja</h3>
              <ul className="space-y-2 text-xs font-light text-stone-300">
                <li><Link to="/shop">Ver Tudo</Link></li>
                <li><Link to="/cart">Meu Carrinho</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest mb-4 text-brand-gold">Ajuda</h3>
              <ul className="space-y-2 text-xs font-light text-stone-300">
                <li><Link to="/contact">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest mb-4 text-brand-gold">Social</h3>
              <div className="flex justify-center md:justify-start space-x-4 text-stone-300">
                <a href="https://www.instagram.com/completa_modafeminina/" target="_blank"><Instagram size={20} /></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};