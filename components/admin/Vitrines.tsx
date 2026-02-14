import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Search, Star, TrendingUp, ImageIcon } from 'lucide-react';

export const AdminVitrines: React.FC = () => {
  const { products, toggleProductStatus } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.isActive && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif text-brand-dark">Gerenciar Vitrines</h1>
        <p className="text-stone-500 text-sm font-light mt-2">Destaque produtos na página inicial (Home).</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-white">
             <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-3.5 text-stone-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar produtos ativos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all placeholder-stone-400"
                />
            </div>
        </div>

        <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4 text-center">Lançamento</th>
                <th className="px-6 py-4 text-center">Mais Vendido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded-md overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="text-stone-300" />
                            )}
                        </div>
                        <div>
                            <div className="font-serif text-lg text-brand-dark mb-1">{product.name}</div>
                            <div className="text-[10px] uppercase tracking-widest text-stone-400">{product.category}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => toggleProductStatus(product.id, 'isLaunch')}
                        className={`p-3 rounded-full transition-all duration-300 ${
                            product.isLaunch 
                            ? 'bg-brand-gold text-white shadow-md scale-110' 
                            : 'bg-stone-100 text-stone-300 hover:bg-stone-200'
                        }`}
                        title="Toggle Lançamento"
                    >
                        <Star size={20} fill={product.isLaunch ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => toggleProductStatus(product.id, 'isBestSeller')}
                        className={`p-3 rounded-full transition-all duration-300 ${
                            product.isBestSeller 
                            ? 'bg-brand-brown text-white shadow-md scale-110' 
                            : 'bg-stone-100 text-stone-300 hover:bg-stone-200'
                        }`}
                        title="Toggle Mais Vendido"
                    >
                        <TrendingUp size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
        {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-stone-400 text-sm font-light">
                Nenhum produto ativo encontrado para exibir.
            </div>
        )}
      </div>
    </div>
  );
};