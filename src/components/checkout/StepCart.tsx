import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useCheckoutStore } from '@/store/checkoutStore'
import { formatPrice } from '@/types'

export function StepCart() {
  const items      = useCartStore((s) => s.items)
  const subtotal   = useCartStore((s) => s.subtotal())
  const updateQty  = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const setStep    = useCheckoutStore((s) => s.setStep)

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-2xl font-light text-neutral-400 mb-4">
          Sua sacola está vazia
        </p>
        <Link to="/loja" className="btn-primary">Ver coleções</Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-light mb-6">Minha Sacola</h2>

      <div className="space-y-0 divide-y divide-neutral-100">
        {items.map((item) => {
          const price = item.promoPrice != null && item.promoPrice > 0
            ? item.promoPrice : item.price
          return (
            <div
              key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
              className="flex gap-4 py-5"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-20 h-24 object-cover bg-neutral-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 line-clamp-2 leading-snug">
                  {item.name}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  {item.selectedColor} · {item.selectedSize}
                </p>
                <p className="text-sm font-medium mt-1">{formatPrice(price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-neutral-200">
                    <button
                      onClick={() => updateQty(item.productId, item.selectedColor, item.selectedSize, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.selectedColor, item.selectedSize, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatPrice(price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.productId, item.selectedColor, item.selectedSize)}
                      className="text-neutral-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-neutral-100 pt-5 mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-neutral-500">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-neutral-400 mb-5">Frete calculado na próxima etapa.</p>
        <button onClick={() => setStep('identification')} className="btn-primary w-full">
          Continuar para identificação
        </button>
      </div>
    </div>
  )
}
