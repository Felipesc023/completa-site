import { useEffect } from 'react'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/types'
import clsx from 'clsx'

export function CartDrawer() {
  const items       = useCartStore((s) => s.items)
  const isOpen      = useCartStore((s) => s.isOpen)
  const closeCart   = useCartStore((s) => s.closeCart)
  const removeItem  = useCartStore((s) => s.removeItem)
  const updateQty   = useCartStore((s) => s.updateQuantity)
  const subtotal    = useCartStore((s) => s.subtotal())
  const navigate    = useNavigate()

  // Bloqueia scroll do body quando drawer está aberto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={clsx(
          'fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-drawer',
          'flex flex-col transition-transform duration-350 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Sacola de compras"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} className="text-neutral-700" />
            <h2 className="font-display text-lg font-light tracking-wide">Minha Sacola</h2>
            {items.length > 0 && (
              <span className="text-xs text-neutral-400 font-sans">
                ({items.length} {items.length === 1 ? 'item' : 'itens'})
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="btn-ghost p-1.5 -mr-1.5"
            aria-label="Fechar sacola"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <ShoppingBag size={40} className="text-neutral-200" />
              <div>
                <p className="font-display text-xl font-light text-neutral-600">
                  Sua sacola está vazia
                </p>
                <p className="text-sm text-neutral-400 mt-1">
                  Explore nossas coleções e encontre algo especial.
                </p>
              </div>
              <Link
                to="/loja"
                onClick={closeCart}
                className="btn-primary mt-2"
              >
                Ver coleções
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-50 px-6">
              {items.map((item) => {
                const effectivePrice = item.promoPrice != null && item.promoPrice > 0
                  ? item.promoPrice
                  : item.price
                const itemTotal = effectivePrice * item.quantity

                return (
                  <li key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                    className="py-5 flex gap-4"
                  >
                    {/* Imagem */}
                    <Link
                      to={`/produto/${item.productId}`}
                      onClick={closeCart}
                      className="shrink-0"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-24 object-cover bg-neutral-100"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/produto/${item.productId}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-neutral-800 hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
                      >
                        {item.name}
                      </Link>

                      <div className="mt-1.5 flex gap-3 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          {item.selectedColor}
                        </span>
                        <span>·</span>
                        <span>{item.selectedSize}</span>
                      </div>

                      {/* Preço */}
                      <div className="mt-2">
                        {item.promoPrice != null && item.promoPrice > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="price-promo text-sm">{formatPrice(item.promoPrice)}</span>
                            <span className="price-original">{formatPrice(item.price)}</span>
                          </div>
                        ) : (
                          <span className="price text-sm">{formatPrice(item.price)}</span>
                        )}
                      </div>

                      {/* Controles de quantidade + remover */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-neutral-200">
                          <button
                            onClick={() => updateQty(item.productId, item.selectedColor, item.selectedSize, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-mono text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.productId, item.selectedColor, item.selectedSize, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-neutral-700">
                            {formatPrice(itemTotal)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId, item.selectedColor, item.selectedSize)}
                            className="text-neutral-300 hover:text-red-400 transition-colors"
                            aria-label="Remover item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Rodapé com total e CTA */}
        {items.length > 0 && (
          <div className="border-t border-neutral-100 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Subtotal</span>
              <span className="font-medium text-neutral-800">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-neutral-400">
              Frete calculado na próxima etapa.
            </p>
            <button
              onClick={handleCheckout}
              className="btn-primary w-full text-sm tracking-widest"
            >
              Fechar Compra
            </button>
            <button
              onClick={closeCart}
              className="w-full text-xs text-neutral-400 hover:text-neutral-700 transition-colors py-1"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
