import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, MapPin, Store } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getOrdersByEmail } from '@/services/orders'
import { formatPrice, type Order } from '@/types'
import clsx from 'clsx'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  aguardando_pagamento: { label: 'Aguardando pagamento', color: 'bg-amber-100 text-amber-700' },
  pago:                 { label: 'Pago',                 color: 'bg-green-100 text-green-700' },
  em_separacao:         { label: 'Em separação',         color: 'bg-blue-100 text-blue-700' },
  enviado:              { label: 'Enviado',              color: 'bg-purple-100 text-purple-700' },
  entregue:             { label: 'Entregue',             color: 'bg-neutral-800 text-white' },
  cancelado:            { label: 'Cancelado',            color: 'bg-red-100 text-red-700' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function paymentLabel(method: string) {
  const map: Record<string, string> = {
    pix: 'PIX', credit_card: 'Cartão de crédito', boleto: 'Boleto',
  }
  return map[method] ?? method
}

export function MyOrders() {
  const { user } = useAuth()
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.email) return
    setLoading(true)
    getOrdersByEmail(user.email)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.email])

  if (loading) {
    return (
      <div className="container-loja section">
        <div className="max-w-2xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container-loja py-10 lg:py-14">
      <div className="max-w-2xl mx-auto">

        {/* Cabeçalho */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1">Minha conta</p>
          <h1 className="font-display text-3xl font-light">Meus Pedidos</h1>
          {user?.name && (
            <p className="text-sm text-neutral-500 mt-1">Olá, {user.name.split(' ')[0]}!</p>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 border border-neutral-100">
            <Package size={40} className="text-neutral-200 mx-auto mb-4" />
            <p className="font-display text-xl font-light text-neutral-500 mb-2">
              Nenhum pedido ainda
            </p>
            <p className="text-sm text-neutral-400 mb-6">
              Quando você realizar uma compra, ela aparecerá aqui.
            </p>
            <Link to="/loja" className="btn-primary">
              Explorar coleções
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isExpanded = expanded === order.id
              const sc = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-neutral-100 text-neutral-600' }

              return (
                <div key={order.id} className="border border-neutral-100 bg-white">
                  {/* Linha resumo — clicável */}
                  <button
                    className="w-full flex items-start sm:items-center gap-4 px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                  >
                    {/* Imagem do primeiro item */}
                    <img
                      src={order.items[0]?.imageUrl ?? ''}
                      alt={order.items[0]?.name ?? ''}
                      className="w-14 h-16 object-cover bg-neutral-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={clsx('text-xs px-2 py-0.5 font-medium', sc.color)}>
                          {sc.label}
                        </span>
                        <span className="text-xs text-neutral-400">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 leading-snug">
                        {order.items.length === 1
                          ? order.items[0].name
                          : `${order.items[0].name} e mais ${order.items.length - 1} ${order.items.length - 1 === 1 ? 'item' : 'itens'}`}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {formatDate(order.createdAt)} · {paymentLabel(order.paymentMethod)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-medium">
                        {formatPrice(order.total)}
                      </span>
                      {isExpanded
                        ? <ChevronUp size={15} className="text-neutral-400" />
                        : <ChevronDown size={15} className="text-neutral-400" />}
                    </div>
                  </button>

                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 px-5 py-5 space-y-5 animate-fade-in">

                      {/* Itens */}
                      <div>
                        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3">
                          Itens do pedido
                        </p>
                        <div className="space-y-3">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-14 h-16 object-cover bg-neutral-100 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-neutral-800 leading-snug">{item.name}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                  Cor: {item.color} · Tamanho: {item.size} · Qty: {item.quantity}
                                </p>
                                <p className="text-sm font-medium mt-1">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Entrega */}
                      <div>
                        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">
                          Entrega
                        </p>
                        <div className="flex items-start gap-2 text-sm text-neutral-600">
                          {order.deliveryType === 'pickup' ? (
                            <>
                              <Store size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                              <span>Retirada na loja</span>
                            </>
                          ) : order.address ? (
                            <>
                              <MapPin size={14} className="text-neutral-400 mt-0.5 shrink-0" />
                              <span>
                                {order.address.street}, {order.address.number}
                                {order.address.complement ? ` - ${order.address.complement}` : ''} ·{' '}
                                {order.address.neighborhood} · {order.address.city}/{order.address.state}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {/* Totais */}
                      <div className="border-t border-neutral-100 pt-4 space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Frete</span>
                          <span>
                            {order.shippingPrice > 0
                              ? formatPrice(order.shippingPrice)
                              : <span className="text-green-600">Grátis</span>}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-medium pt-1.5 border-t border-neutral-100">
                          <span>Total</span>
                          <span className="font-mono">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* PIX pendente */}
                      {order.status === 'aguardando_pagamento' && order.pixCopyPaste && (
                        <div className="bg-amber-50 border border-amber-100 p-4 text-sm">
                          <p className="font-medium text-amber-800 mb-2">
                            Pagamento PIX pendente
                          </p>
                          <p className="text-xs text-amber-700 mb-3">
                            Copie o código abaixo e pague no app do seu banco:
                          </p>
                          <div className="flex gap-2">
                            <input
                              readOnly
                              value={order.pixCopyPaste}
                              className="input text-xs py-2 flex-1 font-mono bg-white"
                            />
                            <button
                              onClick={() => navigator.clipboard.writeText(order.pixCopyPaste!)}
                              className="btn-secondary px-3 py-2 text-xs shrink-0"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
