import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useCheckoutStore } from '@/store/checkoutStore'
import { StepCart } from '@/components/checkout/StepCart'
import { StepIdentification } from '@/components/checkout/StepIdentification'
import { StepDelivery } from '@/components/checkout/StepDelivery'
import { StepPayment } from '@/components/checkout/StepPayment'
import { formatPrice } from '@/types'
import clsx from 'clsx'

const STEPS = [
  { id: 'cart',           label: 'Sacola' },
  { id: 'identification', label: 'Identificação' },
  { id: 'delivery',       label: 'Entrega' },
  { id: 'payment',        label: 'Pagamento' },
] as const

export function Checkout() {
  const navigate  = useNavigate()
  const items     = useCartStore((s) => s.items)
  const subtotal  = useCartStore((s) => s.subtotal())
  const { step, deliveryType, selectedShipping } = useCheckoutStore()

  useEffect(() => {
    if (items.length === 0 && step === 'cart') navigate('/loja')
  }, [items, step, navigate])

  const currentIndex = STEPS.findIndex((s) => s.id === step)
  const shipping     = deliveryType === 'pickup' ? 0 : (selectedShipping?.price ?? null)
  const total        = shipping != null ? subtotal + shipping : null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-loja py-4 flex items-center justify-between">
          <span className="font-display text-xl tracking-widest">COMPLETA</span>
          <span className="text-xs text-neutral-400 uppercase tracking-widest">Finalizando compra</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-loja py-4">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                    i < currentIndex  ? 'bg-green-600 text-white'
                    : i === currentIndex ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-400'
                  )}>
                    {i < currentIndex ? '✓' : i + 1}
                  </div>
                  <span className={clsx(
                    'text-xs hidden sm:block',
                    i === currentIndex ? 'text-neutral-900 font-medium' : 'text-neutral-400'
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={clsx(
                    'h-px w-8 sm:w-16 mx-2',
                    i < currentIndex ? 'bg-green-600' : 'bg-neutral-200'
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container-loja py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 lg:p-8">
              {step === 'cart'           && <StepCart />}
              {step === 'identification' && <StepIdentification />}
              {step === 'delivery'       && <StepDelivery />}
              {step === 'payment'        && <StepPayment />}
            </div>
          </div>

          {/* Resumo lateral */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sticky top-24">
              <h3 className="font-display text-lg font-light mb-4">Resumo</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  const price = item.promoPrice != null && item.promoPrice > 0
                    ? item.promoPrice : item.price
                  return (
                    <div key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                      className="flex gap-3">
                      <div className="relative shrink-0">
                        <img src={item.imageUrl} alt={item.name}
                          className="w-14 h-16 object-cover bg-neutral-100" />
                        <span className="absolute -top-1.5 -right-1.5 badge text-2xs">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-700 line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {item.selectedColor} · {item.selectedSize}
                        </p>
                        <p className="text-xs font-medium mt-0.5">{formatPrice(price * item.quantity)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="divider my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Frete</span>
                  <span>
                    {deliveryType === 'pickup'
                      ? <span className="text-green-600 text-xs font-medium">Grátis (retirada)</span>
                      : shipping != null
                      ? formatPrice(shipping)
                      : <span className="text-neutral-400 text-xs">Calculado na entrega</span>}
                  </span>
                </div>
                {selectedShipping && deliveryType === 'delivery' && (
                  <p className="text-xs text-neutral-400">
                    Prazo: até {selectedShipping.estimatedDays} dias úteis
                  </p>
                )}
              </div>

              {total != null && (
                <>
                  <div className="divider my-4" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="font-mono">{formatPrice(total)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
