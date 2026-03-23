import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, CreditCard, Loader2, Copy, Check, ShieldCheck } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useCheckoutStore } from '@/store/checkoutStore'
import { formatPrice, type PaymentMethod } from '@/types'
import clsx from 'clsx'

// Declaração do SDK PagBank (carregado via script no index.html)
declare global {
  interface Window {
    PagSeguro?: {
      encryptCard: (data: {
        publicKey: string
        holder: string
        number: string
        expMonth: string
        expYear: string
        securityCode: string
      }) => { encryptedCard: string; hasErrors: boolean; errors: unknown[] }
    }
  }
}

// Carrega o SDK do PagBank dinamicamente
function loadPagBankSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PagSeguro) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js'
    script.onload  = () => resolve()
    script.onerror = () => reject(new Error('Falha ao carregar SDK PagBank'))
    document.body.appendChild(script)
  })
}

function getInstallments(total: number) {
  const options = []
  for (let i = 1; i <= 12; i++) {
    const value = total / i
    if (value < 10) break
    options.push({ n: i, value })
  }
  return options
}

interface CardForm {
  number: string
  name: string
  expMonth: string
  expYear: string
  cvv: string
  installments: number
}

export function StepPayment() {
  const navigate  = useNavigate()
  const items     = useCartStore((s) => s.items)
  const subtotal  = useCartStore((s) => s.subtotal())
  const clearCart = useCartStore((s) => s.clearCart)
  const { customer, deliveryType, address, selectedShipping, setStep, reset } = useCheckoutStore()

  const shipping = deliveryType === 'pickup' ? 0 : (selectedShipping?.price ?? 0)
  const total    = subtotal + shipping

  const [method,  setMethod]  = useState<PaymentMethod>('pix')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)

  const [pixData, setPixData] = useState<{
    qrCode: string; copyPaste: string; orderId: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const [card, setCard] = useState<CardForm>({
    number: '', name: '', expMonth: '', expYear: '', cvv: '', installments: 1,
  })

  // Carrega SDK ao montar
  useEffect(() => {
    loadPagBankSDK()
      .then(() => setSdkReady(true))
      .catch(() => setError('Não foi possível carregar o módulo de pagamento. Recarregue a página.'))
  }, [])

  const setCardField = (key: keyof CardForm, value: string | number) =>
    setCard((prev) => ({ ...prev, [key]: value }))

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)

  const handleCopyPix = () => {
    if (!pixData) return
    navigator.clipboard.writeText(pixData.copyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const buildBasePayload = () => ({
    customer,
    deliveryType,
    address: deliveryType === 'delivery' ? address : null,
    shippingOption: deliveryType === 'pickup'
      ? { id: 'pickup', name: 'Retirada na loja', price: 0, estimatedDays: 0 }
      : selectedShipping,
    items: items.map((i) => ({
      productId: i.productId,
      name:      i.name,
      quantity:  i.quantity,
      price:     i.promoPrice != null && i.promoPrice > 0 ? i.promoPrice : i.price,
      size:      i.selectedSize,
      color:     i.selectedColor,
      imageUrl:  i.imageUrl,
    })),
    subtotal,
    shippingPrice: shipping,
    total,
  })

  const handlePix = async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/pagbank/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...buildBasePayload(), paymentMethod: 'pix' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar PIX')
      setPixData({ qrCode: data.pixQrCode, copyPaste: data.pixCopyPaste, orderId: data.orderId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCard = async () => {
    if (!card.number || !card.name || !card.expMonth || !card.expYear || !card.cvv) {
      setError('Preencha todos os dados do cartão.')
      return
    }
    if (!sdkReady || !window.PagSeguro) {
      setError('Módulo de pagamento não carregado. Recarregue a página.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Criptografa o cartão no frontend com o SDK do PagBank — NUNCA mandamos dados brutos
      const publicKey = import.meta.env.VITE_PAGBANK_PUBLIC_KEY as string
      const encrypted = window.PagSeguro.encryptCard({
        publicKey,
        holder:       card.name,
        number:       card.number.replace(/\s/g, ''),
        expMonth:     card.expMonth,
        expYear:      card.expYear.length === 2 ? `20${card.expYear}` : card.expYear,
        securityCode: card.cvv,
      })

      if (encrypted.hasErrors) {
        setError('Dados do cartão inválidos. Verifique e tente novamente.')
        setLoading(false)
        return
      }

      // Manda apenas o token criptografado para o backend — nunca os dados brutos
      const res  = await fetch('/api/pagbank/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...buildBasePayload(),
          paymentMethod: 'credit_card',
          card: {
            encryptedCard: encrypted.encryptedCard,
            holderName:    card.name,
            installments:  card.installments,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Pagamento recusado. Verifique os dados.')

      clearCart()
      reset()
      navigate(`/pedido/${data.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const installments = getInstallments(total)

  return (
    <div>
      <h2 className="font-display text-2xl font-light mb-6">Pagamento</h2>

      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6 bg-neutral-50 px-3 py-2">
        <ShieldCheck size={14} className="text-green-600 shrink-0" />
        Pagamento 100% seguro · seus dados são criptografados
      </div>

      {/* Seletor de método */}
      {!pixData && (
        <div className="grid grid-cols-2 gap-3 mb-7">
          {([
            { id: 'pix' as const,         label: 'PIX',    icon: QrCode,       desc: 'Aprovação imediata' },
            { id: 'credit_card' as const, label: 'Cartão', icon: CreditCard,   desc: `até ${installments.length}x` },
          ]).map(({ id, label, icon: Icon, desc }) => (
            <button key={id} onClick={() => { setMethod(id); setError(null) }}
              className={clsx(
                'flex flex-col items-center gap-1.5 p-4 border-2 transition-all',
                method === id
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
              )}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{label}</span>
              <span className={clsx('text-xs', method === id ? 'text-white/60' : 'text-neutral-400')}>
                {desc}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── PIX ── */}
      {method === 'pix' && !pixData && (
        <div className="space-y-4">
          <div className="bg-neutral-50 p-4 border border-neutral-100 text-sm text-neutral-600 space-y-1">
            <p>• Escaneie o QR code ou copie o código PIX</p>
            <p>• Aprovação em até 1 minuto</p>
            <p>• O pedido é confirmado automaticamente</p>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2">{error}</p>}
          <button onClick={handlePix} disabled={loading} className="btn-primary w-full gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
            {loading ? 'Gerando PIX...' : `Gerar PIX · ${formatPrice(total)}`}
          </button>
        </div>
      )}

      {/* ── PIX QR Code ── */}
      {pixData && (
        <div className="text-center space-y-5">
          <p className="text-sm text-neutral-600">Escaneie com o app do seu banco:</p>
          <div className="flex justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.copyPaste)}`}
              alt="QR Code PIX"
              className="w-48 h-48 border border-neutral-200 p-2"
            />
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-2">Ou copie o código PIX:</p>
            <div className="flex items-center gap-2">
              <input readOnly value={pixData.copyPaste}
                className="input text-xs py-2 flex-1 font-mono bg-neutral-50" />
              <button onClick={handleCopyPix}
                className="btn-secondary px-3 py-2 shrink-0 gap-1.5 text-xs">
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700">
            Aguardando confirmação. Não feche esta página.<br />
            Pedido <strong>#{pixData.orderId}</strong>
          </div>
          <p className="text-xs text-neutral-400">
            Após o pagamento, você receberá a confirmação por email.
          </p>
        </div>
      )}

      {/* ── Cartão ── */}
      {method === 'credit_card' && !pixData && (
        <div className="space-y-4">
          <div>
            <label className="label">Número do cartão</label>
            <input
              value={card.number}
              onChange={(e) => setCardField('number', formatCardNumber(e.target.value))}
              className="input font-mono tracking-wider"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              autoComplete="cc-number"
            />
          </div>
          <div>
            <label className="label">Nome no cartão</label>
            <input
              value={card.name}
              onChange={(e) => setCardField('name', e.target.value.toUpperCase())}
              className="input"
              placeholder="NOME COMO NO CARTÃO"
              autoComplete="cc-name"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Mês</label>
              <input
                value={card.expMonth}
                onChange={(e) => setCardField('expMonth', e.target.value.replace(/\D/g, '').slice(0, 2))}
                className="input font-mono"
                placeholder="MM"
                maxLength={2}
                autoComplete="cc-exp-month"
              />
            </div>
            <div>
              <label className="label">Ano</label>
              <input
                value={card.expYear}
                onChange={(e) => setCardField('expYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="input font-mono"
                placeholder="AAAA"
                maxLength={4}
                autoComplete="cc-exp-year"
              />
            </div>
            <div>
              <label className="label">CVV</label>
              <input
                value={card.cvv}
                onChange={(e) => setCardField('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="input font-mono"
                placeholder="000"
                maxLength={4}
                autoComplete="cc-csc"
                type="password"
              />
            </div>
          </div>
          <div>
            <label className="label">Parcelamento</label>
            <select value={card.installments}
              onChange={(e) => setCardField('installments', Number(e.target.value))}
              className="input">
              {installments.map(({ n, value }) => (
                <option key={n} value={n}>
                  {n}x de {formatPrice(value)} sem juros
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2">{error}</p>}

          <button onClick={handleCard} disabled={loading || !sdkReady} className="btn-primary w-full gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
            {loading ? 'Processando...' : `Pagar ${formatPrice(total)}`}
          </button>

          {!sdkReady && (
            <p className="text-xs text-neutral-400 text-center">Carregando módulo de pagamento...</p>
          )}
        </div>
      )}

      {!pixData && (
        <button type="button" onClick={() => setStep('delivery')} className="btn-ghost mt-4 w-full">
          ← Voltar para entrega
        </button>
      )}
    </div>
  )
}
