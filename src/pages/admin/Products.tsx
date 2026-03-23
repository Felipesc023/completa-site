import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import { getAllProductsAdmin, deleteProduct, updateProduct } from '@/services/products'
import { formatPrice, effectivePrice, type Product } from '@/types'
import clsx from 'clsx'

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllProductsAdmin()
      setProducts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(id)
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { isActive: !product.isActive })
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, isActive: !p.isActive } : p)
      )
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-light">Produtos</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{products.length} produtos cadastrados</p>
        </div>
        <Link to="/admin/produtos/novo" className="btn-primary text-sm gap-2">
          <Plus size={15} />
          Novo produto
        </Link>
      </div>

      {/* Busca */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar por nome, categoria ou SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 py-2.5 text-sm"
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-400 text-sm">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="border border-neutral-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal">Produto</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal">Preço</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal hidden sm:table-cell">Estoque</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-neutral-400 font-normal">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map((product) => {
                const price = effectivePrice(product)
                const hasPromo = price < product.price
                return (
                  <tr key={product.id} className={clsx('hover:bg-neutral-50 transition-colors', !product.isActive && 'opacity-50')}>
                    {/* Produto */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-12 object-cover bg-neutral-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-800 truncate">{product.name}</p>
                          {product.sku && <p className="text-xs text-neutral-400">{product.sku}</p>}
                        </div>
                      </div>
                    </td>
                    {/* Categoria */}
                    <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">{product.category}</td>
                    {/* Preço */}
                    <td className="px-4 py-3">
                      <div>
                        <span className={clsx('font-mono', hasPromo ? 'text-promo' : 'text-neutral-800')}>
                          {formatPrice(price)}
                        </span>
                        {hasPromo && (
                          <p className="text-xs text-neutral-400 line-through">{formatPrice(product.price)}</p>
                        )}
                      </div>
                    </td>
                    {/* Estoque */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={clsx('text-xs font-medium',
                        product.stock === 0 ? 'text-red-500' :
                        product.stock <= 5 ? 'text-amber-500' : 'text-green-600'
                      )}>
                        {product.stock === 0 ? 'Esgotado' : `${product.stock} un.`}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={clsx('text-xs px-2 py-1 transition-colors',
                          product.isActive
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                        )}
                      >
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    {/* Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors"
                          title={product.isActive ? 'Desativar' : 'Ativar'}
                        >
                          {product.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <Link
                          to={`/admin/produtos/${product.id}/editar`}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-30"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
