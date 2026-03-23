import { useState, useEffect } from 'react'
import { MessageCircle, ChevronDown, ChevronUp, Package, Search } from 'lucide-react'
import { getAllOrders, updateOrderStatus } from '@/services/orders'
import { openWhatsApp } from '@/lib/whatsapp'
import { formatPrice, type Order, type OrderStatus } from '@/types'
import clsx from 'clsx'

const STATUS_OPTIONS: { value: OrderStatus | 'todos'; label: string; color: string }[] = [
  { value: 'todos',                label: 'Todos',              color: 'bg-neutral-100 text-neutral-600' },
  { value: 'aguardando_pagamento', label: 'Aguardando',         color: 'bg-amber-100 text-amber-700' },
  { value: 'pago',                 label: 'Pago',               color: 'bg-green-100 text-green-700' },
  { value: 'em_separacao',         label: 'Em separação',       color: 'bg-blue-100 text-blue-700' },
  { value: 'enviado',              label: 'Enviado',            color: 'bg-purple-100 text-purple-700' },
  { value: 'entregue',             label: 'Entregue',           color: 'bg-neutral-800 text-white' },
  { value: 'cancelado',            label: 'Cancelado',          color: 'bg-red-100 text-red-700' },
]

function statusConfig(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0]
}

function paymentLabel(method: string) {
  const map: Record<string, string> = {
    pix: 'PIX', credit_card: 'Cartão', boleto: 'Boleto',
  }
  return map[method] ?? method
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function AdminOrders() {
  const [orders,     setOrders]     = useState<Order[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState<OrderStatus | 'todos'>('todos')
  const [search,     setSearch]     = useState('')
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [updating,   setUpdating]   = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getAllOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)
      )
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'todos' || o.status === filter
    const matchSearch = !search ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  // Totais por status
  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-light">Pedidos</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{orders.length} pedidos no total</p>
        </div>
      </div>

      {/* Filtros de status */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={clsx(
              'px-3 py-1.5 text-xs font-medium transition-all',
              filter === s.value
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            )}
          >
            {s.label}
            {s.value !== 'todos' && counts[s.value]
              ? ` (${counts[s.value]})`
              : s.value === 'todos'
              ? ` (${orders.length})`
              : ''}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 py-2.5 text-sm"
        />
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={32} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const isExpanded = expanded === order.id
            const sc = statusConfig(order.status)

            return (
              <div key={order.id} className="border border-neutral-100 bg-white">
                {/* Linha resumo */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                >
                  {/* Status badge */}
                  <span className={clsx('text-xs px-2 py-1 font-medium shrink-0', sc.color)}>
                    {sc.label}
                  </span>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {order.customer.name}
                      </p>
                      <p className="text-xs text-neutral-400 hidden sm:block">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {formatDate(order.createdAt)} · {paymentLabel(order.paymentMethod)} ·{' '}
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>

                  {/* Total */}
                  <p className="font-mono text-sm font-medium text-neutral-800 shrink-0">
                    {formatPrice(order.total)}
                  </p>

                  {/* Expand */}
                  {isExpanded
                    ? <ChevronUp size={15} className="text-neutral-400 shrink-0" />
                    : <ChevronDown size={15} className="text-neutral-400 shrink-0" />}
                </div>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 px-4 py-4 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Cliente */}
                      <div>
                        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Cliente</p>
                        <div className="space-y-1 text-sm text-neutral-700">
                          <p>{order.customer.name}</p>
                          <p className="text-neutral-500">{order.customer.email}</p>
                          <p className="text-neutral-500">{order.customer.phone}</p>
                          <p className="text-neutral-500">CPF: {order.customer.cpf}</p>
                        </div>
                      </div>

                      {/* Entrega */}
                      <div>
                        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Entrega</p>
                        <div className="space-y-1 text-sm text-neutral-700">
                          {order.deliveryType === 'pickup' ? (
                            <p>Retirada na loja</p>
                          ) : order.address ? (
                            <>
                              <p>{order.address.street}, {order.address.number}</p>
                              {order.address.complement && <p>{order.address.complement}</p>}
                              <p>{order.address.neighborhood}</p>
                              <p>{order.address.city}/{order.address.state} — {order.address.cep}</p>
                            </>
                          ) : (
                            <p className="text-neutral-400">Endereço não informado</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Itens */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Itens</p>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name}
                                className="w-10 h-12 object-cover bg-neutral-100 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-neutral-800 truncate">{item.name}</p>
                              <p className="text-xs text-neutral-400">
                                {item.color} · {item.size} · Qtd: {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-mono font-medium shrink-0">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totais */}
                    <div className="border-t border-neutral-100 pt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Subtotal</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Frete</span>
                        <span>{order.shippingPrice > 0 ? formatPrice(order.shippingPrice) : 'Grátis'}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium pt-1 border-t border-neutral-100">
                        <span>Total</span>
                        <span className="font-mono">{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-100">
                      {/* Mudar status */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={updating === order.id}
                          className="input py-1.5 text-xs pr-8 w-auto"
                        >
                          {STATUS_OPTIONS.filter((s) => s.value !== 'todos').map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        {updating === order.id && (
                          <span className="text-xs text-neutral-400">Salvando...</span>
                        )}
                      </div>

                      {/* Botão WhatsApp */}
                      <button
                        onClick={() => openWhatsApp(order)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 text-xs font-medium transition-colors"
                      >
                        <MessageCircle size={13} />
                        Notificar via WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
