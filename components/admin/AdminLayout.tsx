import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, Star, ShoppingCart, Settings, LogOut, ArrowLeft, Menu } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/'); // Unauthorized
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Produtos' },
    { path: '/admin/vitrines', icon: Star, label: 'Vitrines' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
    { path: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="flex h-screen bg-stone-50 font-sans text-brand-dark">
      {/* Sidebar - Light Theme */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col shadow-sm hidden md:flex z-10">
        <div className="p-8 border-b border-stone-100 flex flex-col items-center">
          <h1 className="font-script text-4xl text-brand-dark">Completa</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold mt-2 font-bold">Admin Panel</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
                <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive 
                    ? 'bg-brand-beige text-brand-brown shadow-sm' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-brand-dark'
                }`}
                >
                <item.icon size={18} className={`transition-colors ${isActive ? "text-brand-gold" : "text-stone-400 group-hover:text-brand-gold"}`} />
                {item.label}
                </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 text-sm text-stone-600 bg-stone-50 rounded-lg border border-stone-100">
                <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-xs">
                    {user.name.charAt(0)}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium text-xs">{user.name}</span>
                    <span className="truncate text-[10px] text-stone-400">Administrador</span>
                </div>
            </div>
            <Link to="/" className="flex items-center gap-3 px-4 py-2 text-stone-500 hover:text-brand-brown text-xs uppercase tracking-widest transition-colors mt-2">
                <ArrowLeft size={14} /> Ir para Loja
            </Link>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:bg-red-50 hover:text-red-500 rounded-lg text-sm transition-colors mt-1"
            >
                <LogOut size={16} /> Sair
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#FAFAFA]">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <Outlet />
        </div>
      </main>
    </div>
  );
};