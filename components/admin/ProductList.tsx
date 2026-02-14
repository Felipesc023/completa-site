import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Edit, Trash2, Plus, Search, Eye, EyeOff, ImageIcon } from 'lucide-react';

export const AdminProductList: React.FC = () => {
  const { products, deleteProduct, toggleProductStatus } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-serif text-brand-dark">Produtos</h1>
            <p className="text-stone-500 text-sm font-light mt-1">Gerencie seu catálogo de produtos via CDN.</p>
        </div>
        <Link 
            to="/admin/products/new" 
            className="bg-brand-brown text-white px-6 py-3 rounded-lg text-xs uppercase tracking-[0.15em] font-bold flex items-center gap-2 hover:bg-brand-dark transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
            <Plus size={16} /> Novo Produto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white">
            <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-3.5 text-stone-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por nome ou categoria..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all placeholder-stone-400"
                />
            </div>
            <div className="text-xs text-stone-400 font-medium">
                {filteredProducts.length} itens encontrados
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-stone-50/80 transition-colors group">
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
                            <div className="font-serif text-lg text-brand-dark leading-none mb-1">{product.name}</div>
                            <div className="text-[10px] text-stone-400 uppercase tracking-widest">Ref: {product.id.substring(0,6)}...</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200">
                        {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-brand-dark">
                    <div className="flex flex-col">
                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}</span>
                        {product.salePrice && product.salePrice > 0 && (
                            <span className="text-xs text-green-600">Promo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.salePrice)}</span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                        onClick={() => toggleProductStatus(product.id, 'isActive')}
                        className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                            product.isActive 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                        }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-stone-400'}`}></span>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/products/edit/${product.id}`} className="p-2 text-stone-500 hover:text-brand-brown hover:bg-brand-beige rounded-lg transition-colors" title="Editar">
                            <Edit size={18} />
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-stone-400 text-sm font-light">
                Nenhum produto encontrado.
            </div>
        )}
      </div>
    </div>
  );
};