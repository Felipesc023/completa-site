import type { Order } from '@/types'

// Número do WhatsApp da loja — vem da variável de ambiente
const MERCHANT_WHATSAPP = import.meta.env.VITE_MERCHANT_WHATSAPP as string | undefined

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    pix:         'PIX',
    credit_card: 'Cartão de crédito',
    boleto:      'Boleto',
  }
  return map[method] ?? method
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    aguardando_pagamento: '⏳ Aguardando pagamento',
    pago:                 '✅ Pago',
    em_separacao:         '📦 Em separação',
    enviado:              '🚚 Enviado',
    entregue:             '🏠 Entregue',
    cancelado:            '❌ Cancelado',
  }
  return map[status] ?? status
}

export function buildWhatsAppMessage(order: Order): string {
  const lines: string[] = []

  lines.push(`🛍️ *NOVO PEDIDO — COMPLETA*`)
  lines.push(`📋 Pedido: #${order.id.slice(-8).toUpperCase()}`)
  lines.push(`📅 Data: ${formatDate(order.createdAt)}`)
  lines.push(`📌 Status: ${statusLabel(order.status)}`)
  lines.push(`💳 Pagamento: ${paymentLabel(order.paymentMethod)}`)
  lines.push(``)

  lines.push(`👤 *CLIENTE*`)
  lines.push(`Nome: ${order.customer.name}`)
  lines.push(`Email: ${order.customer.email}`)
  lines.push(`Telefone: ${order.customer.phone}`)
  lines.push(`CPF: ${order.customer.cpf}`)
  lines.push(``)

  lines.push(`📦 *ENTREGA*`)
  if (order.deliveryType === 'pickup') {
    lines.push(`Tipo: Retirada na loja`)
  } else {
    lines.push(`Tipo: Entrega em domicílio`)
    if (order.address) {
      const a = order.address
      lines.push(`Endereço: ${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ''}`)
      lines.push(`Bairro: ${a.neighborhood}`)
      lines.push(`Cidade: ${a.city}/${a.state}`)
      lines.push(`CEP: ${a.cep}`)
    }
  }
  lines.push(``)

  lines.push(`🛒 *ITENS*`)
  order.items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.name}`)
    lines.push(`   Cor: ${item.color} | Tamanho: ${item.size} | Qtd: ${item.quantity}`)
    lines.push(`   Valor: ${formatCurrency(item.price * item.quantity)}`)
  })
  lines.push(``)

  lines.push(`💰 *VALORES*`)
  lines.push(`Subtotal: ${formatCurrency(order.subtotal)}`)
  if (order.shippingPrice > 0) {
    lines.push(`Frete: ${formatCurrency(order.shippingPrice)}`)
  } else {
    lines.push(`Frete: Grátis (retirada)`)
  }
  lines.push(`*Total: ${formatCurrency(order.total)}*`)

  return lines.join('\n')
}

export function buildWhatsAppUrl(order: Order, targetPhone?: string): string {
  const phone = targetPhone ?? MERCHANT_WHATSAPP ?? ''
  const message = buildWhatsAppMessage(order)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encoded}`
}

// Abre o WhatsApp direto
export function openWhatsApp(order: Order, targetPhone?: string): void {
  const url = buildWhatsAppUrl(order, targetPhone)
  window.open(url, '_blank', 'noopener,noreferrer')
}
