import React from 'react';
import { useProducts } from '../../context/ProductContext';
import { Package, DollarSign, Users, ShoppingBag } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { products } = useProducts();

  const activeProducts = products.filter(p => p.isActive).length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStock = products.filter(p => (p.stock || 0) < 5).length;

  const StatCard = ({ title, value, icon: Icon, colorClass, iconColor }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon size={24} className={iconColor} />
      </div>
      <div>
        <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">{title}</p>
        <h3 className="text-3xl font-serif text-brand-dark leading-none">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-serif text-brand-dark">Dashboard</h1>
            <p className="text-stone-500 text-sm font-light mt-2">Visão geral da sua loja Completa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Produtos" 
            value={products.length} 
            icon={Package} 
            colorClass="bg-blue-50" 
            iconColor="text-blue-500"
        />
        <StatCard 
            title="Produtos Ativos" 
            value={activeProducts} 
            icon={ShoppingBag} 
            colorClass="bg-green-50" 
            iconColor="text-green-500"
        />
        <StatCard 
            title="Estoque Total" 
            value={totalStock} 
            icon={Package} 
            colorClass="bg-brand-beige" 
            iconColor="text-brand-brown"
        />
        <StatCard 
            title="Estoque Baixo" 
            value={lowStock} 
            icon={DollarSign} 
            colorClass="bg-red-50" 
            iconColor="text-red-500"
        />
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
        <h2 className="text-xl font-serif text-brand-dark mb-4">Bem-vindo ao Painel Admin</h2>
        <p className="text-stone-500 font-light leading-relaxed max-w-3xl">
          Aqui você pode gerenciar todo o catálogo da Completa. Utilize a barra lateral para navegar entre produtos, vitrines e configurações. 
          O sistema foi atualizado para oferecer uma experiência mais limpa e focada.
        </p>
      </div>
    </div>
  );
};