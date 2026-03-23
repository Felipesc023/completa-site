import type { VercelRequest, VercelResponse } from '@vercel/node'

const RESEND_API = 'https://api.resend.com/emails'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pago: 'Confirmado', aguardando_pagamento: 'Aguardando pagamento',
  }
  return map[status] ?? status
}

function buildCustomerEmail(order: any): string {
  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #f5f5f4;">
        <div style="font-size:14px;color:#292524;">${item.name}</div>
        <div style="font-size:12px;color:#78716c;margin-top:2px;">
          ${item.color} · ${item.size} · Qtd: ${item.quantity}
        </div>
      </td>
      <td style="padding:10px;border-bottom:1px solid #f5f5f4;text-align:right;font-family:monospace;font-size:14px;color:#292524;">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')

  const addressHtml = order.deliveryType === 'pickup'
    ? `<p style="margin:0;color:#78716c;font-size:14px;">Retirada na loja</p>`
    : order.address ? `
        <p style="margin:0;color:#78716c;font-size:14px;">
          ${order.address.street}, ${order.address.number}
          ${order.address.complement ? ` - ${order.address.complement}` : ''}<br/>
          ${order.address.neighborhood} · ${order.address.city}/${order.address.state}<br/>
          CEP: ${order.address.cep}
        </p>` : ''

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;">

        <!-- Header -->
        <tr>
          <td style="background:#0c0a09;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;letter-spacing:8px;color:#ffffff;font-weight:300;">
              COMPLETA
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;font-weight:300;color:#1c1917;">
              Pedido confirmado!
            </h1>
            <p style="margin:0 0 24px;font-size:14px;color:#78716c;">
              Olá, ${order.customer.name.split(' ')[0]}! Recebemos seu pedido e estamos cuidando de tudo para você.
            </p>

            <!-- Status -->
            <div style="background:#f5f5f4;padding:16px;margin-bottom:24px;">
              <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:4px;color:#a8a29e;">
                Status do pedido
              </p>
              <p style="margin:4px 0 0;font-size:16px;color:#1c1917;font-weight:500;">
                ${statusLabel(order.status)}
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#a8a29e;">
                Pedido #${order.id?.slice(-8)?.toUpperCase() ?? ''}
              </p>
            </div>

            <!-- Itens -->
            <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:4px;color:#a8a29e;">
              Itens
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              ${itemsHtml}
            </table>

            <!-- Totais -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#78716c;">Subtotal</td>
                <td style="padding:6px 0;font-size:14px;color:#292524;text-align:right;font-family:monospace;">
                  ${formatCurrency(order.subtotal)}
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:14px;color:#78716c;">Frete</td>
                <td style="padding:6px 0;font-size:14px;color:#292524;text-align:right;font-family:monospace;">
                  ${order.shippingPrice > 0 ? formatCurrency(order.shippingPrice) : 'Grátis'}
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0 6px;font-size:15px;font-weight:600;color:#1c1917;border-top:1px solid #f5f5f4;">
                  Total
                </td>
                <td style="padding:10px 0 6px;font-size:15px;font-weight:600;color:#1c1917;text-align:right;font-family:monospace;border-top:1px solid #f5f5f4;">
                  ${formatCurrency(order.total)}
                </td>
              </tr>
            </table>

            <!-- Entrega -->
            <div style="border-top:1px solid #f5f5f4;padding-top:24px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:4px;color:#a8a29e;">
                Entrega
              </p>
              ${addressHtml}
            </div>

            <!-- Botão ver pedido -->
            <div style="text-align:center;margin-top:32px;">
              <a href="${process.env.SITE_URL ?? 'https://completa-site.vercel.app'}/minha-conta/pedidos"
                style="display:inline-block;background:#0c0a09;color:#ffffff;text-decoration:none;padding:14px 32px;font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                Ver meus pedidos
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f4;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a8a29e;">
              Dúvidas? Entre em contato pelo WhatsApp ou email.<br/>
              © Completa Moda Feminina
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildStoreEmail(order: any): string {
  const method: Record<string, string> = {
    pix: 'PIX', credit_card: 'Cartão de crédito', boleto: 'Boleto',
  }
  const itemsText = order.items.map((i: any) =>
    `• ${i.name} | Cor: ${i.color} | Tam: ${i.size} | Qtd: ${i.quantity} | ${formatCurrency(i.price * i.quantity)}`
  ).join('<br/>')

  const addressText = order.deliveryType === 'pickup'
    ? 'Retirada na loja'
    : order.address
    ? `${order.address.street}, ${order.address.number} - ${order.address.neighborhood}, ${order.address.city}/${order.address.state} - CEP: ${order.address.cep}`
    : 'Endereço não informado'

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:Arial,sans-serif;padding:32px;background:#f5f5f4;">
  <div style="max-width:500px;background:#fff;padding:32px;border:1px solid #e7e5e4;">
    <h2 style="margin:0 0 4px;font-size:20px;color:#1c1917;">🛍️ Novo pedido recebido!</h2>
    <p style="margin:0 0 24px;color:#78716c;font-size:14px;">
      Pedido #${order.id?.slice(-8)?.toUpperCase() ?? ''} · ${method[order.paymentMethod] ?? order.paymentMethod}
    </p>

    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:3px;color:#a8a29e;">Cliente</p>
    <p style="margin:0 0 16px;font-size:14px;color:#292524;">
      ${order.customer.name}<br/>
      ${order.customer.email}<br/>
      ${order.customer.phone}<br/>
      CPF: ${order.customer.cpf}
    </p>

    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:3px;color:#a8a29e;">Itens</p>
    <p style="margin:0 0 16px;font-size:14px;color:#292524;line-height:1.8;">${itemsText}</p>

    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:3px;color:#a8a29e;">Entrega</p>
    <p style="margin:0 0 16px;font-size:14px;color:#292524;">${addressText}</p>

    <div style="border-top:1px solid #e7e5e4;padding-top:16px;">
      <p style="margin:0;font-size:16px;font-weight:600;color:#1c1917;">
        Total: ${formatCurrency(order.total)}
      </p>
    </div>
  </div>
</body>
</html>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { order } = req.body
  if (!order?.customer?.email) return res.status(400).json({ error: 'Dados inválidos' })

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.warn('RESEND_API_KEY não configurado — emails não enviados')
    return res.status(200).json({ ok: true, skipped: true })
  }

  const fromEmail = process.env.EMAIL_FROM ?? 'Completa <noreply@completa.com.br>'
  const storeEmail = process.env.MERCHANT_EMAIL ?? ''

  try {
    // Email para o cliente
    await fetch(RESEND_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    fromEmail,
        to:      [order.customer.email],
        subject: `Pedido confirmado — #${order.id?.slice(-8)?.toUpperCase() ?? ''}`,
        html:    buildCustomerEmail(order),
      }),
    })

    // Email para a loja
    if (storeEmail) {
      await fetch(RESEND_API, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    fromEmail,
          to:      [storeEmail],
          subject: `🛍️ Novo pedido — ${order.customer.name} — ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}`,
          html:    buildStoreEmail(order),
        }),
      })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Email error:', err)
    return res.status(500).json({ error: 'Erro ao enviar email' })
  }
}
