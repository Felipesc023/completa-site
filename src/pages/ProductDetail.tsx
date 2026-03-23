import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ShoppingBag, Heart, Minus, Plus, ChevronDown } from 'lucide-react'
import { getProductById } from '@/services/products'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, effectivePrice, type Product } from '@/types'
import clsx from 'clsx'

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product,       setProduct]       = useState<Product | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize,  setSelectedSize]  = useState<string>('')
  const [quantity,      setQuantity]      = useState(1)
  const [activeImg,     setActiveImg]     = useState(0)
  const [addedToCart,   setAddedToCart]   = useState(false)
  const [sizeError,     setSizeError]     = useState(false)
  const [openSection,   setOpenSection]   = useState<string | null>('descricao')

  const addItem  = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProductById(id)
      .then((p) => {
        setProduct(p)
        if (p?.colors.length) setSelectedColor(p.colors[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="container-loja py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-neutral-100" />
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-neutral-100 w-1/4" />
            <div className="h-8 bg-neutral-100 w-3/4" />
            <div className="h-6 bg-neutral-100 w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-loja section text-center">
        <p className="font-display text-2xl font-light text-neutral-400 mb-4">Produto não encontrado</p>
        <Link to="/loja" className="btn-primary">Ver coleções</Link>
      </div>
    )
  }

  // Galeria de imagens — usa imageUrl + images[]
  const allImages = [
    product.imageUrl,
    ...(product.images ?? []).filter(Boolean),
  ].filter(Boolean)

  const price    = effectivePrice(product)
  const hasPromo = (product.promoPrice != null && product.promoPrice > 0) ||
                   (product.salePrice != null && product.salePrice > 0)
  const discount = hasPromo ? Math.round((1 - price / product.price) * 100) : 0

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true)
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSizeError(false)
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      promoPrice: product.promoPrice,
      selectedSize,
      selectedColor,
      imageUrl: product.imageUrl,
      quantity,
      weightKg: product.weightKg,
      lengthCm: product.lengthCm,
      widthCm: product.widthCm,
      heightCm: product.heightCm,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
    openCart()
  }

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key))
  }

  return (
    <div className="container-loja py-6 lg:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
        <Link to="/" className="hover:text-neutral-700 transition-colors">Início</Link>
        <span>/</span>
        <Link to="/loja" className="hover:text-neutral-700 transition-colors">Coleções</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/loja?categoria=${product.category}`} className="hover:text-neutral-700 transition-colors">
              {product.category}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* ── Galeria ── */}
        <div className="flex gap-3">
          {/* Miniaturas */}
          {allImages.length > 1 && (
            <div className="flex flex-col gap-2 w-16 shrink-0">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={clsx(
                    'aspect-square overflow-hidden border-2 transition-all',
                    activeImg === i ? 'border-neutral-900' : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Imagem principal */}
          <div className="flex-1 aspect-[3/4] overflow-hidden bg-neutral-100 relative group">
            <img
              src={allImages[activeImg] ?? product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {hasPromo && discount > 0 && (
              <div className="absolute top-4 left-4">
                <span className="tag-promo">-{discount}%</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Informações ── */}
        <div className="space-y-6">
          {/* Nome e marca */}
          <div>
            {product.brand && (
              <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">{product.brand}</p>
            )}
            <h1 className="font-display text-3xl lg:text-4xl font-light text-neutral-900 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Preço */}
          <div className="flex items-baseline gap-3">
            {hasPromo ? (
              <>
                <span className="font-mono text-2xl text-promo font-medium">{formatPrice(price)}</span>
                <span className="price-original text-base">{formatPrice(product.price)}</span>
                <span className="tag-promo">-{discount}%</span>
              </>
            ) : (
              <span className="font-mono text-2xl text-neutral-900">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="divider" />

          {/* Seleção de cor */}
          {product.colors.length > 0 && (
            <div>
              <p className="label">
                Cor — <span className="normal-case font-normal text-neutral-600">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={clsx(
                      'px-3 py-1.5 text-xs border transition-all',
                      selectedColor === color
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-500'
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de tamanho */}
          <div id="size-selector">
            <div className="flex items-center justify-between mb-2">
              <p className={clsx('label', sizeError && 'text-red-500')}>
                {sizeError ? 'Selecione um tamanho' : 'Tamanho'}
              </p>
              <button className="text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-700 transition-colors">
                Guia de tamanhos
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setSizeError(false) }}
                  className={clsx(
                    'min-w-[44px] px-3 py-2 text-sm border transition-all',
                    selectedSize === size
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : sizeError
                      ? 'border-red-300 text-neutral-600 hover:border-neutral-500'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-500'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <p className="label mb-2">Quantidade</p>
            <div className="flex items-center border border-neutral-200 w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-mono text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-xs text-amber-600 mt-1.5">
                Apenas {product.stock} {product.stock === 1 ? 'unidade restante' : 'unidades restantes'}
              </p>
            )}
          </div>

          {/* CTAs */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={clsx(
                'btn-primary flex-1 gap-2',
                addedToCart && 'bg-green-700 hover:bg-green-700'
              )}
            >
              <ShoppingBag size={16} />
              {product.stock === 0
                ? 'Esgotado'
                : addedToCart
                ? 'Adicionado!'
                : 'Adicionar à sacola'}
            </button>
            <button
              className="btn-secondary px-4"
              aria-label="Adicionar à lista de desejos"
            >
              <Heart size={16} />
            </button>
          </div>

          <div className="divider" />

          {/* Acordeons — Descrição, Composição, Medidas */}
          <div className="space-y-0 divide-y divide-neutral-100">
            {[
              { key: 'descricao', label: 'Descrição', content: product.description },
              { key: 'composicao', label: 'Composição e cuidados', content: product.composition ?? product.care },
              {
                key: 'medidas',
                label: 'Dimensões e peso',
                content: `Peso: ${product.weightKg}kg · ${product.lengthCm}×${product.widthCm}×${product.heightCm}cm`
              },
            ].filter((s) => s.content).map((section) => (
              <div key={section.key}>
                <button
                  onClick={() => toggleSection(section.key)}
                  className="flex items-center justify-between w-full py-4 text-sm font-medium text-neutral-800 hover:text-neutral-600 transition-colors"
                >
                  {section.label}
                  <ChevronDown
                    size={15}
                    className={clsx('transition-transform duration-200 text-neutral-400',
                      openSection === section.key && 'rotate-180'
                    )}
                  />
                </button>
                {openSection === section.key && (
                  <div className="pb-4 text-sm text-neutral-600 leading-relaxed animate-fade-in">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
