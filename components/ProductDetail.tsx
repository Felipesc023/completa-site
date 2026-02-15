
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ArrowLeft, Heart, ImageOff, Plus, Minus } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const product = products.find(p => p.id === id);

  if (!product || !product.isActive) {
    return <div className="p-20 text-center text-stone-500">Produto não encontrado ou indisponível.</div>;
  }

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product, selectedSize, quantity);
    }
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <div className="pt-8 pb-20 bg-white min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-stone-500 hover:text-brand-dark mb-8 text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="mr-2" /> Voltar
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4">
             <div className="aspect-[3/4] bg-stone-100 rounded-sm overflow-hidden relative group">
                {product.imageUrl ? (
                    <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ImageOff size={64} />
                    </div>
                )}
             </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-brand-gold text-xs uppercase tracking-[0.2em] mb-2">{product.category}</span>
            <div className="flex justify-between items-start">
                <h1 className="font-serif text-4xl text-brand-dark mb-4">{product.name}</h1>
            </div>
            
            <div className="mb-8">
                {product.promoPrice && product.promoPrice > 0 ? (
                    <div className="flex items-center gap-4">
                         <p className="text-3xl font-light text-brand-dark">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promoPrice)}
                        </p>
                        <p className="text-xl font-light text-stone-400 line-through">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                        </p>
                    </div>
                ) : (
                     <p className="text-2xl font-light text-stone-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </p>
                )}
            </div>

            <div className="mb-8">
              <p className="text-stone-600 font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-dark block mb-3">Tamanho</span>
              <div className="flex space-x-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center border transition-all rounded-sm ${
                      selectedSize === size
                        ? 'border-brand-dark bg-brand-dark text-white'
                        : 'border-stone-300 text-stone-600 hover:border-brand-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-dark block mb-3">Quantidade</span>
              <div className="flex items-center gap-4 border border-stone-200 w-fit p-1 rounded-sm">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-brand-dark hover:bg-stone-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-brand-dark hover:bg-stone-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                disabled={!selectedSize}
                onClick={handleAddToCart}
                className={`flex-grow py-4 text-sm uppercase tracking-widest font-medium transition-all rounded-sm ${
                    selectedSize
                    ? 'bg-brand-gold text-white hover:bg-yellow-600 shadow-lg'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
                >
                {selectedSize ? 'Adicionar ao Carrinho' : 'Selecione um tamanho'}
                </button>
                
                <button 
                    onClick={toggleWishlist}
                    className={`w-14 flex items-center justify-center border border-stone-200 rounded-sm transition-colors ${isWishlisted ? 'text-red-500 border-red-200 bg-red-50' : 'text-stone-400 hover:text-brand-dark hover:border-brand-dark'}`}
                >
                    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
