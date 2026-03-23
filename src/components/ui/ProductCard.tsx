import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { type Product, formatPrice, effectivePrice } from '@/types'
import clsx from 'clsx'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const price    = effectivePrice(product)
  const hasPromo = (product.promoPrice != null && product.promoPrice > 0) ||
                   (product.salePrice != null && product.salePrice > 0)
  const discount = hasPromo
    ? Math.round((1 - price / product.price) * 100)
    : 0

  return (
    <Link
      to={`/produto/${product.id}`}
      className={clsx('group block', className)}
    >
      {/* Imagem */}
      <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isLaunch && (
            <span className="tag-new">Novo</span>
          )}
          {hasPromo && discount > 0 && (
            <span className="tag-promo">-{discount}%</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault()
            // TODO: implementar wishlist
          }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          aria-label="Adicionar à lista de desejos"
        >
          <Heart size={15} className="text-neutral-600" />
        </button>

        {/* Cores disponíveis */}
        {product.colors.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                className="text-2xs bg-white/90 backdrop-blur-sm px-1.5 py-0.5 text-neutral-600 font-sans"
              >
                {color}
              </span>
            ))}
            {product.colors.length > 4 && (
              <span className="text-2xs bg-white/90 backdrop-blur-sm px-1.5 py-0.5 text-neutral-500">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        {product.brand && (
          <p className="text-2xs uppercase tracking-widest text-neutral-400 font-sans">
            {product.brand}
          </p>
        )}
        <h3 className="text-sm text-neutral-800 font-sans leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 pt-0.5">
          {hasPromo ? (
            <>
              <span className="price-promo text-sm">{formatPrice(price)}</span>
              <span className="price-original">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="price text-sm">{formatPrice(product.price)}</span>
          )}
        </div>
        {/* Tamanhos disponíveis */}
        {product.sizes.length > 0 && (
          <p className="text-2xs text-neutral-400 font-sans">
            {product.sizes.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}
