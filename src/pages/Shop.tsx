import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import { getProducts, getCategories } from '@/services/products'
import type { Product, FilterState, SortOption } from '@/types'
import clsx from 'clsx'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',       label: 'Mais recentes' },
  { value: 'best_selling', label: 'Mais vendidos' },
  { value: 'price_asc',    label: 'Menor preço' },
  { value: 'price_desc',   label: 'Maior preço' },
  { value: 'discount',     label: 'Maior desconto' },
]

const SIZES_COMMON = ['PP', 'P', 'M', 'G', 'GG', '34', '36', '38', '40', '42', '44', '46']

const EMPTY_FILTERS: FilterState = {
  category: [],
  colors: [],
  sizes: [],
  minPrice: '',
  maxPrice: '',
}

export function Shop() {
  const [searchParams] = useSearchParams()
  const [products,   setProducts]   = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filters,    setFilters]    = useState<FilterState>(EMPTY_FILTERS)
  const [sort,       setSort]       = useState<SortOption>('newest')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const cat      = searchParams.get('categoria')
    const promo    = searchParams.get('promo')
    const sortParam = searchParams.get('sort') as SortOption | null
    if (sortParam) setSort(sortParam)
    if (promo === 'true') setSort('discount')
    if (cat) setFilters((f) => ({ ...f, category: [cat] }))
  }, [searchParams])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProducts(filters, sort)
      setProducts(data)
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, sort])

  useEffect(() => { loadProducts() }, [loadProducts])

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  const toggleFilter = (
    key: keyof Pick<FilterState, 'category' | 'colors' | 'sizes'>,
    value: string
  ) => {
    setFilters((prev) => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const clearFilters = () => setFilters(EMPTY_FILTERS)

  const activeFilterCount =
    filters.category.length + filters.colors.length + filters.sizes.length +
    (filters.minPrice !== '' ? 1 : 0) + (filters.maxPrice !== '' ? 1 : 0)

  return (
    <div className="container-loja py-8 lg:py-12">
      {/* Cabeçalho */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-light">
            {filters.category.length === 1 ? filters.category[0] : 'Coleções'}
          </h1>
          {!loading && (
            <p className="text-sm text-neutral-400 mt-1">
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none input pr-8 py-2 text-sm cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
          >
            <SlidersHorizontal size={14} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterPanel
            filters={filters} categories={categories}
            onToggle={toggleFilter}
            onPriceChange={(key, val) => setFilters((f) => ({ ...f, [key]: val }))}
            onClear={clearFilters} activeCount={activeFilterCount}
          />
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-neutral-100" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-neutral-100 w-2/3 rounded" />
                    <div className="h-3 bg-neutral-100 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl font-light text-neutral-400 mb-3">
                Nenhum produto encontrado
              </p>
              <p className="text-sm text-neutral-400 mb-6">
                Tente ajustar os filtros ou explorar outras categorias.
              </p>
              <button onClick={clearFilters} className="btn-secondary">
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer filtros mobile */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-neutral-900/40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h2 className="font-medium text-neutral-800">Filtros</h2>
              <button onClick={() => setDrawerOpen(false)} className="btn-ghost p-1"><X size={18} /></button>
            </div>
            <div className="p-5">
              <div className="mb-6">
                <p className="label">Ordenar por</p>
                <div className="space-y-1 mt-2">
                  {SORT_OPTIONS.map((o) => (
                    <button key={o.value} onClick={() => setSort(o.value)}
                      className={clsx('w-full text-left px-3 py-2 text-sm transition-colors',
                        sort === o.value ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'
                      )}
                    >{o.label}</button>
                  ))}
                </div>
              </div>
              <FilterPanel
                filters={filters} categories={categories}
                onToggle={toggleFilter}
                onPriceChange={(key, val) => setFilters((f) => ({ ...f, [key]: val }))}
                onClear={clearFilters} activeCount={activeFilterCount}
              />
            </div>
            <div className="sticky bottom-0 p-5 border-t border-neutral-100 bg-white">
              <button onClick={() => setDrawerOpen(false)} className="btn-primary w-full">
                Ver {products.length} produtos
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface FilterPanelProps {
  filters: FilterState
  categories: string[]
  onToggle: (key: keyof Pick<FilterState, 'category' | 'colors' | 'sizes'>, value: string) => void
  onPriceChange: (key: 'minPrice' | 'maxPrice', val: number | '') => void
  onClear: () => void
  activeCount: number
}

function FilterPanel({ filters, categories, onToggle, onPriceChange, onClear, activeCount }: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {activeCount > 0 && (
        <button onClick={onClear} className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-2">
          Limpar todos os filtros
        </button>
      )}
      {categories.length > 0 && (
        <div>
          <p className="label">Categoria</p>
          <div className="space-y-1.5 mt-2">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={filters.category.includes(cat)}
                  onChange={() => onToggle('category', cat)} className="w-3.5 h-3.5 accent-neutral-900" />
                <span className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="label">Tamanho</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SIZES_COMMON.map((size) => (
            <button key={size} onClick={() => onToggle('sizes', size)}
              className={clsx('px-2.5 py-1 text-xs border transition-colors',
                filters.sizes.includes(size)
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
              )}
            >{size}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="label">Preço (R$)</p>
        <div className="flex items-center gap-2 mt-2">
          <input type="number" placeholder="Mín" value={filters.minPrice}
            onChange={(e) => onPriceChange('minPrice', e.target.value ? Number(e.target.value) : '')}
            className="input py-2 text-sm w-full" />
          <span className="text-neutral-300 shrink-0">—</span>
          <input type="number" placeholder="Máx" value={filters.maxPrice}
            onChange={(e) => onPriceChange('maxPrice', e.target.value ? Number(e.target.value) : '')}
            className="input py-2 text-sm w-full" />
        </div>
      </div>
    </div>
  )
}
