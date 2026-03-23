import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

function getAdminDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY ?? '{}')
    initializeApp({ credential: cert(serviceAccount) })
  }
  return getFirestore()
}

// Mapa de status PagBank → status interno
const STATUS_MAP: Record<string, string> = {
  PAID:      'pago',
  CANCELED:  'cancelado',
  DECLINED:  'cancelado',
  IN_ANALYSIS: 'aguardando_pagamento',
  WAITING:   'aguardando_pagamento',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { charges, qr_codes } = req.body

    // reference_id tem formato "completa-{timestamp}" — usamos para encontrar o pedido
    // Mas salvamos o pagbankOrderId, então buscamos por ele
    const pagbankOrderId = req.body.id as string | undefined
    if (!pagbankOrderId) return res.status(400).json({ error: 'ID inválido' })

    // Determina status
    const charge   = charges?.[0]
    const qrCode   = qr_codes?.[0]
    const rawStatus = charge?.status ?? qrCode?.status ?? ''
    const status    = STATUS_MAP[rawStatus] ?? 'aguardando_pagamento'

    const db = getAdminDb()

    // Busca pedido pelo pagbankOrderId
    const snap = await db.collection('orders')
      .where('pagbankOrderId', '==', pagbankOrderId)
      .limit(1)
      .get()

    if (snap.empty) {
      console.warn('Webhook: pedido não encontrado para', pagbankOrderId)
      return res.status(200).json({ ok: true }) // retorna 200 para PagBank não retentar
    }

    const orderRef = snap.docs[0].ref
    const update: Record<string, unknown> = {
      status,
      updatedAt: Timestamp.now(),
    }
    if (status === 'pago') {
      update.paidAt = Timestamp.now()
    }

    await orderRef.update(update)

    console.log(`Pedido ${orderRef.id} → status: ${status}`)

    // TODO: notificar loja via WhatsApp se status === 'pago'

    return res.status(200).json({ ok: true })

  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
