
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { Product, FilterState, SortOption } from '../types';
import { FilterBar } from './FilterBar';
import { useProducts } from '../context/ProductContext';

export const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products } = useProducts();
  const activeProducts = products.filter(p => p.isActive);
  
  // Filter States
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    colors: [],
    sizes: [],
    brands: [],
    minPrice: '',
    maxPrice: ''
  });

  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort');

    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: [categoryParam] }));
    }
    
    if (sortParam) {
        if(sortParam === 'new') setSortBy('newest');
        if(sortParam === 'best') setSortBy('best_selling');
    }

    // Handle search in filter logic
  }, [searchParams]);

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

  const filterProducts = () => {
    let result = [...activeProducts];

    const searchParam = searchParams.get('search');
    if (searchParam) {
      const lower = searchParam.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.category.toLowerCase().includes(lower)
      );
    }

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

  const sortProducts = (products: Product[]) => {
    switch (sortBy) {
      case 'newest':
        return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'best_selling':
        return products.sort((a, b) => b.soldCount - a.soldCount);
      case 'price_asc':
        return products.sort((a, b) => {
             // Fix: Renamed salePrice to promoPrice to match Product interface
             const priceA = a.promoPrice || a.price;
             const priceB = b.promoPrice || b.price;
             return priceA - priceB;
        });
      case 'price_desc':
        return products.sort((a, b) => {
             // Fix: Renamed salePrice to promoPrice to match Product interface
             const priceA = a.promoPrice || a.price;
             const priceB = b.promoPrice || b.price;
             return priceB - priceA;
        });
      case 'discount':
        return products.sort((a, b) => {
            // Fix: Renamed salePrice to promoPrice to match Product interface
            const discountA = a.promoPrice ? (a.price - a.promoPrice) / a.price : 0;
            const discountB = b.promoPrice ? (b.price - b.promoPrice) / b.price : 0;
            return discountB - discountA;
        });
      case 'relevance':
      default:
        return products;
    }
  };

  const filteredProducts = sortProducts(filterProducts());

  return (
    <div className="pt-8 pb-20 animate-fade-in bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="font-serif text-4xl text-brand-dark mb-2">Loja</h1>
          <p className="text-stone-500 font-light text-sm max-w-xl mx-auto">
            {filteredProducts.length} produtos encontrados
          </p>
        </div>

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-stone-50 rounded border border-dashed border-stone-200">
            <p className="text-stone-500 font-light mb-4">Nenhum produto encontrado com os filtros selecionados.</p>
            <button onClick={clearFilters} className="text-brand-gold underline hover:text-brand-dark uppercase text-xs tracking-widest">
                Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
