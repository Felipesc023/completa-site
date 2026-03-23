import { useState } from 'react'
import { MapPin, Store, Loader2 } from 'lucide-react'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useCartStore } from '@/store/cartStore'
import { calculateShipping, fetchAddressByCEP } from '@/services/shipping'
import { formatCEP, formatPrice, type ShippingAddress, type ShippingOption } from '@/types'
import clsx from 'clsx'

const STORE_ADDRESS = 'Rua da Loja, 123 — Centro, Ribeirão Preto/SP'

export function StepDelivery() {
  const items = useCartStore((s) => s.items)
  const {
    deliveryType, setDeliveryType,
    address, setAddress,
    selectedShipping, setSelectedShipping,
    setStep,
  } = useCheckoutStore()

  const [form, setForm] = useState<ShippingAddress>(address ?? {
    cep: '', street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '',
  })
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError,   setCepError]   = useState<string | null>(null)
  const [errors,     setErrors]     = useState<Partial<Record<keyof ShippingAddress, string>>>({})

  const setField = (key: keyof ShippingAddress, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleCEP = async (raw: string) => {
    const formatted = formatCEP(raw)
    setField('cep', formatted)
    setCepError(null)

    const digits = formatted.replace(/\D/g, '')
    if (digits.length !== 8) return

    setCepLoading(true)
    try {
      const addr = await fetchAddressByCEP(digits)
      if (addr) {
        setForm((prev) => ({ ...prev, ...addr, cep: formatted }))
        // Calcula frete automaticamente
        const options = calculateShipping(digits, items)
        setShippingOptions(options)
        setSelectedShipping(options[0])
      } else {
        setCepError('CEP não encontrado. Verifique e tente novamente.')
      }
    } catch {
      setCepError('Erro ao buscar CEP.')
    } finally {
      setCepLoading(false)
    }
  }

  const validate = (): boolean => {
    if (deliveryType === 'pickup') return true
    const errs: Partial<Record<keyof ShippingAddress, string>> = {}
    if (!form.cep || form.cep.replace(/\D/g, '').length !== 8) errs.cep = 'CEP inválido'
    if (!form.street.trim())       errs.street       = 'Rua obrigatória'
    if (!form.number.trim())       errs.number       = 'Número obrigatório'
    if (!form.neighborhood.trim()) errs.neighborhood = 'Bairro obrigatório'
    if (!form.city.trim())         errs.city         = 'Cidade obrigatória'
    if (!form.state.trim())        errs.state        = 'Estado obrigatório'
    if (!selectedShipping)         errs.cep          = 'Selecione uma opção de frete'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (deliveryType === 'delivery') setAddress(form)
    setStep('payment')
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-light mb-6">Entrega</h2>

      {/* Tipo de entrega */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        <button
          type="button"
          onClick={() => setDeliveryType('delivery')}
          className={clsx(
            'flex flex-col items-center gap-2 p-4 border-2 transition-all',
            deliveryType === 'delivery'
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
          )}
        >
          <MapPin size={20} />
          <span className="text-sm font-medium">Receber em casa</span>
        </button>

        <button
          type="button"
          onClick={() => setDeliveryType('pickup')}
          className={clsx(
            'flex flex-col items-center gap-2 p-4 border-2 transition-all',
            deliveryType === 'pickup'
              ? 'border-neutral-900 bg-neutral-900 text-white'
              : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
          )}
        >
          <Store size={20} />
          <span className="text-sm font-medium">Retirar na loja</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {deliveryType === 'pickup' ? (
          /* Retirada na loja */
          <div className="bg-neutral-50 p-5 border border-neutral-100 mb-6">
            <div className="flex items-start gap-3">
              <Store size={18} className="text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-neutral-800 mb-1">
                  Completa Moda Feminina
                </p>
                <p className="text-sm text-neutral-500">{STORE_ADDRESS}</p>
                <p className="text-xs text-neutral-400 mt-2">
                  Seg–Sex: 9h às 18h · Sáb: 9h às 13h
                </p>
                <p className="text-xs text-neutral-500 mt-2 font-medium">
                  Frete: Grátis
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Entrega em domicílio */
          <div className="space-y-4 mb-6">
            {/* CEP */}
            <div>
              <label className="label">CEP *</label>
              <div className="relative">
                <input
                  value={form.cep}
                  onChange={(e) => handleCEP(e.target.value)}
                  className="input pr-10"
                  placeholder="00000-000"
                  maxLength={9}
                  autoComplete="postal-code"
                />
                {cepLoading && (
                  <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin" />
                )}
              </div>
              {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
              {errors.cep && <p className="text-xs text-red-500 mt-1">{errors.cep}</p>}
              <a
                href="https://buscacepinter.correios.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-700 mt-1 inline-block"
              >
                Não sei meu CEP
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label">Rua / Avenida *</label>
                <input
                  value={form.street}
                  onChange={(e) => setField('street', e.target.value)}
                  className="input"
                  placeholder="Nome da rua"
                  autoComplete="address-line1"
                />
                {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
              </div>
              <div>
                <label className="label">Número *</label>
                <input
                  value={form.number}
                  onChange={(e) => setField('number', e.target.value)}
                  className="input"
                  placeholder="123"
                />
                {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Complemento</label>
                <input
                  value={form.complement}
                  onChange={(e) => setField('complement', e.target.value)}
                  className="input"
                  placeholder="Apto, bloco..."
                />
              </div>
              <div>
                <label className="label">Bairro *</label>
                <input
                  value={form.neighborhood}
                  onChange={(e) => setField('neighborhood', e.target.value)}
                  className="input"
                  placeholder="Bairro"
                />
                {errors.neighborhood && <p className="text-xs text-red-500 mt-1">{errors.neighborhood}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label">Cidade *</label>
                <input
                  value={form.city}
                  onChange={(e) => setField('city', e.target.value)}
                  className="input"
                  placeholder="Cidade"
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="label">UF *</label>
                <input
                  value={form.state}
                  onChange={(e) => setField('state', e.target.value.toUpperCase())}
                  className="input"
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>
            </div>

            {/* Opções de frete */}
            {shippingOptions.length > 0 && (
              <div className="mt-2">
                <p className="label mb-2">Opção de entrega *</p>
                <div className="space-y-2">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={clsx(
                        'flex items-center justify-between p-3 border cursor-pointer transition-all',
                        selectedShipping?.id === opt.id
                          ? 'border-neutral-900 bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping?.id === opt.id}
                          onChange={() => setSelectedShipping(opt)}
                          className="accent-neutral-900"
                        />
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{opt.name}</p>
                          <p className="text-xs text-neutral-400">
                            {opt.carrier} · até {opt.estimatedDays} dias úteis
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium font-mono">
                        {formatPrice(opt.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep('identification')}
            className="btn-ghost"
          >
            ← Voltar
          </button>
          <button type="submit" className="btn-primary flex-1">
            Continuar para pagamento
          </button>
        </div>
      </form>
    </div>
  )
}
