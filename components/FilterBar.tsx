import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { CATEGORIES, COLORS, BRANDS } from '../constants';
import { FilterState, SortOption, Product } from '../types';

const ALL_SIZES = ["36", "38", "40", "42", "P", "M", "G", "GG"];

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  sortBy: SortOption;
  setSortBy: React.Dispatch<React.SetStateAction<SortOption>>;
  clearFilters: () => void;
  getActiveFiltersCount: () => number;
  products: Product[]; // Used for counts
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  sortBy,
  setSortBy,
  clearFilters,
  getActiveFiltersCount,
  products
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[type] as string[];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [type]: [...current, value] };
      }
    });
  };

  const FilterDropdown = ({ title, type, options, activeValues }: { title: string, type: keyof FilterState, options: string[], activeValues: string[] }) => (
    <div className="relative">
      <button 
        onClick={() => setOpenDropdown(openDropdown === type ? null : type as string)}
        className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border transition-all ${openDropdown === type || activeValues.length > 0 ? 'border-brand-dark bg-stone-50' : 'border-transparent hover:bg-stone-50'}`}
      >
        {title} {activeValues.length > 0 && `(${activeValues.length})`} <ChevronDown size={12} className={`transition-transform ${openDropdown === type ? 'rotate-180' : ''}`} />
      </button>
      
      {openDropdown === type && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-xl border border-stone-100 z-20 p-4 rounded-sm animate-fade-in">
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer hover:bg-stone-50 p-1 rounded">
                <input 
                  type="checkbox" 
                  checked={activeValues.includes(opt)}
                  onChange={() => toggleFilter(type, opt)}
                  className="rounded border-stone-300 text-brand-dark focus:ring-brand-gold"
                />
                <span className="text-sm text-stone-600 capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filter Bar */}
      <div className="hidden md:flex flex-wrap items-center justify-between border-y border-stone-100 py-4 mb-8" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest mr-4 text-brand-dark">Filtrar por:</span>
          
          <FilterDropdown title="Categorias" type="category" options={CATEGORIES.map(c => c.name)} activeValues={filters.category} />
          <FilterDropdown title="Cor" type="colors" options={COLORS} activeValues={filters.colors} />
          <FilterDropdown title="Tamanho" type="sizes" options={ALL_SIZES} activeValues={filters.sizes} />
          <FilterDropdown title="Marca" type="brands" options={BRANDS} activeValues={filters.brands} />
          
          {/* Price Filter Custom */}
          <div className="relative">
              <button 
                  onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border transition-all ${openDropdown === 'price' || filters.minPrice !== '' || filters.maxPrice !== '' ? 'border-brand-dark bg-stone-50' : 'border-transparent hover:bg-stone-50'}`}
              >
                  Preço <ChevronDown size={12} className={`transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'price' && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-xl border border-stone-100 z-20 p-4 rounded-sm">
                      <div className="flex items-center gap-2">
                          <input 
                              type="number" 
                              placeholder="Min" 
                              value={filters.minPrice}
                              onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value ? Number(e.target.value) : ''}))}
                              className="w-1/2 p-2 border border-stone-200 text-sm"
                          />
                          <span className="text-stone-400">-</span>
                          <input 
                              type="number" 
                              placeholder="Max" 
                              value={filters.maxPrice}
                              onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value ? Number(e.target.value) : ''}))}
                              className="w-1/2 p-2 border border-stone-200 text-sm"
                          />
                      </div>
                  </div>
              )}
          </div>

          {getActiveFiltersCount() > 0 && (
            <button onClick={clearFilters} className="text-xs text-stone-400 underline hover:text-red-500 ml-4">
              Limpar filtros
            </button>
          )}
        </div>

        {/* Desktop Sorting */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 group cursor-pointer relative">
              <span className="text-xs text-stone-500 uppercase tracking-widest">Ordenar por:</span>
              <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  {sortBy === 'relevance' && 'Relevância'}
                  {sortBy === 'newest' && 'Novidades'}
                  {sortBy === 'best_selling' && 'Mais Vendidos'}
                  {sortBy === 'price_asc' && 'Menor Preço'}
                  {sortBy === 'price_desc' && 'Maior Preço'}
                  {sortBy === 'discount' && 'Maior Desconto'}
                  <ChevronDown size={12} />
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-xl border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 rounded-sm">
                  {[
                      { label: 'Novidades', value: 'newest' },
                      { label: 'Mais Vendidos', value: 'best_selling' },
                      { label: 'Menor Preço', value: 'price_asc' },
                      { label: 'Maior Preço', value: 'price_desc' },
                      { label: 'Relevância', value: 'relevance' },
                      { label: 'Maior Desconto', value: 'discount' },
                  ].map(opt => (
                      <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value as SortOption)}
                          className={`block w-full text-left px-3 py-2 text-xs uppercase tracking-widest hover:bg-stone-50 ${sortBy === opt.value ? 'text-brand-gold font-bold' : 'text-stone-600'}`}
                      >
                          {opt.label}
                      </button>
                  ))}
              </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Buttons */}
      <div className="md:hidden flex gap-4 mb-6 sticky top-20 z-30 bg-white py-2">
          <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex-1 bg-stone-100 text-brand-dark py-3 px-4 rounded-sm flex items-center justify-center gap-2 uppercase text-xs tracking-widest font-bold"
          >
              <SlidersHorizontal size={16} /> Filtrar {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </button>
          <button 
              onClick={() => setIsMobileSortOpen(true)}
              className="flex-1 bg-stone-100 text-brand-dark py-3 px-4 rounded-sm flex items-center justify-center gap-2 uppercase text-xs tracking-widest font-bold"
          >
              <ArrowUpDown size={16} /> Ordenar
          </button>
      </div>

      {/* Applied Filters Chips */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.category.map(cat => (
            <span key={cat} className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-stone-200">
              {cat} <button onClick={() => toggleFilter('category', cat)}><X size={12}/></button>
            </span>
          ))}
          {filters.colors.map(c => (
            <span key={c} className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-stone-200">
              {c} <button onClick={() => toggleFilter('colors', c)}><X size={12}/></button>
            </span>
          ))}
            {filters.brands.map(b => (
            <span key={b} className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-stone-200">
              {b} <button onClick={() => toggleFilter('brands', b)}><X size={12}/></button>
            </span>
          ))}
          {filters.sizes.map(s => (
            <span key={s} className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-stone-200">
              {s} <button onClick={() => toggleFilter('sizes', s)}><X size={12}/></button>
            </span>
          ))}
          {(filters.minPrice !== '' || filters.maxPrice !== '') && (
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-stone-200">
              R$ {filters.minPrice || 0} - R$ {filters.maxPrice || '...'} <button onClick={() => setFilters(prev => ({...prev, minPrice: '', maxPrice: ''}))}><X size={12}/></button>
            </span>
          )}
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
              <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
                  <div className="p-4 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h2 className="font-serif text-xl text-brand-dark">Filtros</h2>
                      <button onClick={() => setIsMobileFilterOpen(false)}><X size={24} /></button>
                  </div>
                  
                  <div className="p-4 space-y-6 flex-grow">
                        {/* Categories Mobile */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-stone-400">Categorias</h3>
                            <div className="space-y-2">
                                {CATEGORIES.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-3">
                                        <input type="checkbox" checked={filters.category.includes(cat.name)} onChange={() => toggleFilter('category', cat.name)} className="rounded text-brand-dark focus:ring-brand-gold"/>
                                        <span className="text-sm">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Colors Mobile */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-stone-400">Cores</h3>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(color => (
                                    <button 
                                        key={color} 
                                        onClick={() => toggleFilter('colors', color)}
                                        className={`px-3 py-1 border text-xs rounded-full ${filters.colors.includes(color) ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-stone-600 border-stone-200'}`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sizes Mobile */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-stone-400">Tamanhos</h3>
                            <div className="flex flex-wrap gap-2">
                                {ALL_SIZES.map(size => (
                                    <button 
                                        key={size} 
                                        onClick={() => toggleFilter('sizes', size)}
                                        className={`w-10 h-10 border text-xs flex items-center justify-center rounded ${filters.sizes.includes(size) ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-stone-600 border-stone-200'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                         {/* Brands Mobile */}
                         <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-stone-400">Marcas</h3>
                            <div className="space-y-2">
                                {BRANDS.map(brand => (
                                    <label key={brand} className="flex items-center gap-3">
                                        <input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => toggleFilter('brands', brand)} className="rounded text-brand-dark focus:ring-brand-gold"/>
                                        <span className="text-sm">{brand}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                         {/* Price Mobile */}
                         <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-stone-400">Faixa de Preço</h3>
                            <div className="flex gap-4">
                                <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value ? Number(e.target.value) : ''}))} className="w-full p-2 border border-stone-200 rounded text-sm"/>
                                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value ? Number(e.target.value) : ''}))} className="w-full p-2 border border-stone-200 rounded text-sm"/>
                            </div>
                        </div>
                  </div>

                  <div className="p-4 border-t border-stone-100 bg-stone-50 sticky bottom-0">
                      <div className="flex gap-4">
                          <button onClick={clearFilters} className="flex-1 py-3 text-xs uppercase tracking-widest border border-stone-300 rounded text-stone-500">Limpar</button>
                          <button onClick={() => setIsMobileFilterOpen(false)} className="flex-[2] py-3 text-xs uppercase tracking-widest bg-brand-dark text-white rounded shadow-lg">Ver Resultados</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Mobile Sort Sheet/Drawer */}
      {isMobileSortOpen && (
          <div className="fixed inset-0 z-[60] flex flex-col justify-end">
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileSortOpen(false)}></div>
             <div className="relative bg-white rounded-t-xl p-6 shadow-2xl animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-xl text-brand-dark">Ordenar por</h2>
                    <button onClick={() => setIsMobileSortOpen(false)}><X size={24} /></button>
                </div>
                <div className="space-y-1">
                    {[
                        { label: 'Novidades', value: 'newest' },
                        { label: 'Mais Vendidos', value: 'best_selling' },
                        { label: 'Menor Preço', value: 'price_asc' },
                        { label: 'Maior Preço', value: 'price_desc' },
                        { label: 'Relevância', value: 'relevance' },
                        { label: 'Maior Desconto', value: 'discount' },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value as SortOption); setIsMobileSortOpen(false); }}
                            className={`w-full text-left py-3 px-2 border-b border-stone-100 text-sm uppercase tracking-widest flex justify-between items-center ${sortBy === opt.value ? 'text-brand-gold font-bold' : 'text-stone-600'}`}
                        >
                            {opt.label}
                            {sortBy === opt.value && <ChevronDown className="rotate-[-90deg]" size={16}/>}
                        </button>
                    ))}
                </div>
             </div>
          </div>
      )}
    </>
  );
};
