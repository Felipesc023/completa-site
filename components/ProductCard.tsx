
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ImageOff } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden aspect-[3/4] mb-3 md:mb-4 bg-stone-100 rounded-sm">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
                <ImageOff size={48} />
            </div>
          )}

          {product.promoPrice && product.promoPrice > 0 && (
             <div className="absolute top-2 left-2 bg-brand-dark text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm z-10">
                Promo
             </div>
          )}

           {product.isLaunch && (
             <div className="absolute top-2 left-2 bg-brand-gold text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm z-10" style={{ top: product.promoPrice ? '32px' : '8px' }}>
                Novo
             </div>
          )}
          
          <div className="absolute bottom-0 left-0 w-full bg-white/90 py-2 md:py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-center">
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-brand-dark">Ver Detalhes</span>
          </div>
          
          <button 
            onClick={toggleWishlist}
            className="absolute top-2 right-2 p-1.5 md:p-2 bg-white/80 rounded-full text-brand-dark hover:text-red-500 hover:bg-white transition-all shadow-sm z-10"
          >
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} className={`w-4 h-4 md:w-[18px] md:h-[18px] ${isWishlisted ? "text-red-500" : ""}`} />
          </button>
        </div>
        <h3 className="text-xs md:text-sm font-medium text-brand-dark mb-1 group-hover:text-brand-gold transition-colors leading-tight">{product.name}</h3>
        <div className="flex items-center gap-2">
            {product.promoPrice && product.promoPrice > 0 ? (
                <>
                    <p className="text-xs md:text-sm text-brand-dark font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promoPrice)}
                    </p>
                    <p className="text-xs text-stone-400 line-through">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </p>
                </>
            ) : (
                <p className="text-xs md:text-sm text-stone-500 font-light">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </p>
            )}
        </div>
      </Link>
    </div>
  );
};
