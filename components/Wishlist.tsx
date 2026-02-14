import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from './ProductCard';
import { Heart } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { wishlistIds } = useWishlist();
  const { products } = useProducts();

  // Filter products that are in the wishlist
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id) && p.isActive);

  return (
    <div className="pt-8 pb-20 animate-fade-in bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center py-12">
            <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full mb-4">
                <Heart className="text-red-500 w-8 h-8" />
            </div>
          <h1 className="font-serif text-4xl text-brand-dark mb-4">Lista de Desejos</h1>
          <p className="text-stone-500 font-light max-w-xl mx-auto">
            Suas peças favoritas salvas em um só lugar.
          </p>
        </div>

        {/* Content */}
        {wishlistProducts.length > 0 ? (
          /* Grid Adjustment: grid-cols-2 for mobile */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-stone-50 rounded-lg border border-dashed border-stone-200">
            <p className="text-stone-400 font-light mb-6">Sua lista de desejos está vazia.</p>
            <Link 
              to="/shop" 
              className="inline-block bg-brand-dark text-white px-8 py-3 uppercase text-xs tracking-widest font-medium hover:bg-brand-gold transition-all rounded-sm"
            >
              Explorar Loja
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};