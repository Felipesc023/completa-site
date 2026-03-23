import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

// Inicializa Firebase Admin (backend only)
function getAdminDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY ?? '{}')
    initializeApp({ credential: cert(serviceAccount) })
  }
  return getFirestore()
}

const PAGBANK_BASE = process.env.PAGBANK_ENV === 'production'
  ? 'https://api.pagseguro.com'
  : 'https://sandbox.api.pagseguro.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    customer, deliveryType, address, shippingOption,
    items, subtotal, shippingPrice, total,
    paymentMethod, card,
  } = req.body

  // Validação mínima server-side
  if (!customer?.email || !items?.length || !total || total <= 0) {
    return res.status(400).json({ error: 'Dados do pedido inválidos' })
  }

  // Recalcula o total no backend para evitar manipulação
  const itemsTotal = items.reduce(
    (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
    0
  )
  const serverTotal = Math.round((itemsTotal + (shippingPrice ?? 0)) * 100) / 100
  if (Math.abs(serverTotal - total) > 0.01) {
    return res.status(400).json({ error: 'Total inválido' })
  }

  try {
    const db = getAdminDb()

    // Monta payload base do PagBank
    const pagbankPayload: Record<string, unknown> = {
      reference_id: `completa-${Date.now()}`,
      customer: {
        name:  customer.name,
        email: customer.email,
        tax_id: customer.cpf.replace(/\D/g, ''),
        phones: [{
          country: '55',
          area: customer.phone.replace(/\D/g, '').slice(0, 2),
          number: customer.phone.replace(/\D/g, '').slice(2),
          type: 'MOBILE',
        }],
      },
      items: items.map((i: { name: string; quantity: number; price: number }) => ({
        name:      i.name.slice(0, 64),
        quantity:  i.quantity,
        unit_amount: Math.round(i.price * 100), // centavos
      })),
      shipping: deliveryType === 'delivery' ? {
        address: {
          street:      address.street,
          number:      address.number,
          complement:  address.complement ?? '',
          locality:    address.neighborhood,
          city:        address.city,
          region_code: address.state,
          country:     'BRA',
          postal_code: address.cep.replace(/\D/g, ''),
        },
      } : undefined,
    }

    // Charges por método de pagamento
    if (paymentMethod === 'pix') {
      pagbankPayload.qr_codes = [{
        amount: { value: Math.round(total * 100) },
        expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      }]
    } else if (paymentMethod === 'credit_card') {
      // Usamos o encryptedCard gerado pelo SDK PagBank no frontend
      // Os dados brutos do cartão NUNCA chegam ao nosso backend
      pagbankPayload.charges = [{
        reference_id: `charge-${Date.now()}`,
        description:  'Completa Moda Feminina',
        amount: {
          value:    Math.round(total * 100),
          currency: 'BRL',
        },
        payment_method: {
          type:         'CREDIT_CARD',
          installments: card.installments ?? 1,
          capture:      true,
          card: {
            encrypted: card.encryptedCard,
            holder:    { name: card.holderName },
          },
        },
      }]
    }

    // Chama API do PagBank
    const pagbankRes = await fetch(`${PAGBANK_BASE}/orders`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.PAGBANK_TOKEN}`,
      },
      body: JSON.stringify(pagbankPayload),
    })

    const pagbankData = await pagbankRes.json()

    if (!pagbankRes.ok) {
      console.error('PagBank error:', pagbankData)
      return res.status(502).json({
        error: 'Erro ao processar pagamento. Verifique os dados e tente novamente.',
      })
    }

    // Extrai dados do PIX se necessário
    let pixQrCode    = ''
    let pixCopyPaste = ''
    if (paymentMethod === 'pix' && pagbankData.qr_codes?.[0]) {
      const qr     = pagbankData.qr_codes[0]
      pixQrCode    = qr.links?.find((l: { rel: string }) => l.rel === 'QRCODE.PNG')?.href ?? ''
      pixCopyPaste = qr.text ?? ''
    }

    // Salva pedido no Firestore
    const orderDoc = {
      pagbankOrderId: pagbankData.id,
      customer,
      deliveryType,
      address:        deliveryType === 'delivery' ? address : null,
      shippingOption: shippingOption ?? null,
      items,
      subtotal,
      shippingPrice:  shippingPrice ?? 0,
      total,
      paymentMethod,
      status:         paymentMethod === 'pix' ? 'aguardando_pagamento' : 'pago',
      pixQrCode,
      pixCopyPaste,
      createdAt:      Timestamp.now(),
      updatedAt:      Timestamp.now(),
    }

    const orderRef = await db.collection('orders').add(orderDoc)

    // Dispara email de confirmação de forma assíncrona (não bloqueia a resposta)
    const siteUrl = process.env.SITE_URL ?? 'https://completa-site.vercel.app'
    fetch(`${siteUrl}/api/email/send-order-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: { ...orderDoc, id: orderRef.id } }),
    }).catch((e) => console.error('Email dispatch error:', e))

    return res.status(200).json({
      orderId:      orderRef.id,
      pagbankId:    pagbankData.id,
      pixQrCode,
      pixCopyPaste,
      status:       orderDoc.status,
    })

  } catch (err) {
    console.error('create-order error:', err)
    return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
}
