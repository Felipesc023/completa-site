import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { FilterBar } from './FilterBar';
import { FilterState, SortOption, Product } from '../types';
import { useProducts } from '../context/ProductContext';

export const Home: React.FC = () => {
  const { products } = useProducts();

  // Filter Active Products Only
  const activeProducts = products.filter(p => p.isActive);

  // Lançamentos based on isLaunch flag
  const newArrivals = activeProducts.filter(p => p.isLaunch).slice(0, 4);

  // Mais Vendidos based on isBestSeller flag
  const bestSellers = activeProducts.filter(p => p.isBestSeller).slice(0, 4);
  
  // Filter States for Home
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    colors: [],
    sizes: [],
    brands: [],
    minPrice: '',
    maxPrice: ''
  });
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [displayCount, setDisplayCount] = useState(8);

  const clearFilters = () => {
    setFilters({
      category: [],
      colors: [],
      sizes: [],
      brands: [],
      minPrice: '',
      maxPrice: ''
    });
  };

  const getActiveFiltersCount = () => {
    return filters.category.length + filters.colors.length + filters.sizes.length + filters.brands.length + (filters.minPrice !== '' || filters.maxPrice !== '' ? 1 : 0);
  };

  // Filter Logic
  const filterProducts = () => {
    let result = [...activeProducts];

    if (filters.category.length > 0) {
      result = result.filter(p => filters.category.includes(p.category));
    }
    if (filters.colors.length > 0) {
      result = result.filter(p => p.colors.some(c => filters.colors.includes(c)));
    }
    if (filters.brands.length > 0) {
      result = result.filter(p => p.brand && filters.brands.includes(p.brand));
    }
    if (filters.sizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => filters.sizes.includes(s)));
    }
    if (filters.minPrice !== '') {
      result = result.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== '') {
      result = result.filter(p => p.price <= Number(filters.maxPrice));
    }

    return result;
  };

  // Sort Logic
  const sortProducts = (products: Product[]) => {
    switch (sortBy) {
      case 'newest':
        return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'best_selling':
        return products.sort((a, b) => b.soldCount - a.soldCount);
      case 'price_asc':
        return products.sort((a, b) => {
             const priceA = a.salePrice || a.price;
             const priceB = b.salePrice || b.price;
             return priceA - priceB;
        });
      case 'price_desc':
        return products.sort((a, b) => {
             const priceA = a.salePrice || a.price;
             const priceB = b.salePrice || b.price;
             return priceB - priceA;
        });
      case 'discount':
        return products.sort((a, b) => {
            const discountA = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
            const discountB = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
            return discountB - discountA;
        });
      case 'relevance':
      default:
        return products;
    }
  };

  const filteredProducts = sortProducts(filterProducts());
  const displayedProducts = filteredProducts.slice(0, displayCount);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full bg-stone-100 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Banner Completa - Moda Feminina" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-95"
        />
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl text-white">
            <p className="text-sm uppercase tracking-[0.3em] mb-4 text-brand-beige drop-shadow-md">Nova Coleção 2024</p>
            <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight drop-shadow-lg">
              Elegância em<br/>cada detalhe.
            </h1>
            <p className="text-lg font-light mb-8 max-w-md drop-shadow-md text-stone-100">
              Descubra peças exclusivas que unem sofisticação, conforto e modernidade para a mulher que sabe o que quer.
            </p>
            <Link 
              to="/shop" 
              className="inline-block bg-white text-brand-dark px-10 py-4 uppercase text-xs tracking-widest font-medium hover:bg-brand-gold hover:text-white transition-all duration-300 rounded-sm"
            >
              Comprar Agora
            </Link>
          </div>
        </div>
      </section>

      {/* Lançamentos (New Arrivals) Section */}
      {newArrivals.length > 0 && (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
                <div>
                <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-2">Lançamentos</h2>
                <div className="w-12 h-0.5 bg-brand-gold"></div>
                </div>
                <Link to="/shop?sort=new" className="text-xs uppercase tracking-widest text-stone-500 hover:text-brand-dark flex items-center gap-1 group">
                Ver Coleção <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
            </div>

            {/* Grid Adjustment: grid-cols-2 for mobile, gap-x-4 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
                {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
            </div>
        </section>
      )}

       {/* Mais Vendidos (Best Sellers) Section */}
       {bestSellers.length > 0 && (
        <section className="py-20 bg-stone-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
                <div>
                <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-2">Mais Vendidos</h2>
                <div className="w-12 h-0.5 bg-brand-gold"></div>
                </div>
                <Link to="/shop?sort=best" className="text-xs uppercase tracking-widest text-stone-500 hover:text-brand-dark flex items-center gap-1 group">
                Ver todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
            </div>

            {/* Grid Adjustment: grid-cols-2 for mobile */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
                {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
            </div>
        </section>
       )}

      {/* Todas as peças Section with Filters */}
      <section className="py-20 bg-brand-beige/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-3">Todas as Peças</h2>
            <div className="w-16 h-0.5 bg-brand-gold mx-auto"></div>
          </div>

          {/* Filters included here */}
          <FilterBar 
            filters={filters}
            setFilters={setFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            clearFilters={clearFilters}
            getActiveFiltersCount={getActiveFiltersCount}
            products={products}
          />

          {/* Grid Adjustment: grid-cols-2 for mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-8 mb-12">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
             <div className="text-center py-10 bg-white rounded border border-dashed border-stone-200 mb-12">
                <p className="text-stone-500 font-light mb-4">Nenhum produto encontrado com os filtros selecionados.</p>
                <button onClick={clearFilters} className="text-brand-gold underline hover:text-brand-dark uppercase text-xs tracking-widest">
                    Limpar todos os filtros
                </button>
            </div>
          )}

          {displayCount < filteredProducts.length && (
            <div className="text-center">
              <button 
                onClick={() => setDisplayCount(prev => prev + 4)}
                className="inline-flex items-center gap-2 border border-brand-dark text-brand-dark px-10 py-3 uppercase text-xs tracking-widest hover:bg-brand-dark hover:text-white transition-all duration-300 rounded-sm"
              >
                Carregar Mais <Plus size={16}/>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Brand Snippet */}
      <section className="py-24 bg-brand-dark text-center text-white px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-script text-5xl mb-6">Completa</h2>
          <p className="text-xl font-light italic text-stone-300 mb-8">
            "Acreditamos que a verdadeira elegância está em se sentir completa consigo mesma."
          </p>
        </div>
      </section>
    </div>
  );
};