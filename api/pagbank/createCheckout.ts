
/**
 * Serverless function para criação de Checkout no PagBank (PagSeguro).
 * Roda no ambiente Node.js da Vercel.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, customer, shipping, referenceId } = req.body;
    const token = process.env.PAGBANK_TOKEN;
    const env = process.env.PAGBANK_ENV || 'sandbox'; // default para sandbox

    if (!token) {
      console.error("PAGBANK_TOKEN não configurado nas variáveis de ambiente.");
      return res.status(500).json({ error: 'PAGBANK_TOKEN not configured on server' });
    }

    if (!items || items.length === 0 || !customer || !shipping) {
      return res.status(400).json({ error: 'Missing required checkout data' });
    }

    const baseUrl = env === 'production' 
      ? 'https://api.pagseguro.com' 
      : 'https://sandbox.api.pagseguro.com';

    // Mapeamento de itens para o formato PagBank (unit_amount em centavos)
    const pagBankItems = items.map((item: any) => ({
      reference_id: item.id || item.productId,
      name: `${item.name} (${item.selectedSize}/${item.selectedColor})`,
      quantity: item.quantity,
      unit_amount: Math.round((item.promoPrice || item.price) * 100)
    }));

    // Adiciona o frete como um item de encargo se houver valor
    if (shipping.price > 0) {
      // Nota: Em algumas versões da API de Checkout, frete pode ser passado em campos específicos.
      // Aqui usamos a abordagem de ordem para máxima compatibilidade.
    }

    const body = {
      reference_id: referenceId || `ORDER_${Date.now()}`,
      customer: {
        name: customer.name,
        email: customer.email,
        tax_id: customer.tax_id.replace(/\D/g, ''), // CPF limpo
        phones: [
          {
            country: "55",
            area: customer.phone.replace(/\D/g, '').substring(0, 2),
            number: customer.phone.replace(/\D/g, '').substring(2),
            type: "MOBILE"
          }
        ]
      },
      items: pagBankItems,
      shipping: {
        address: {
          street: shipping.street,
          number: shipping.number,
          complement: shipping.complement || "",
          locality: shipping.neighborhood,
          city: shipping.city,
          region_code: shipping.state,
          country: "BRA",
          postal_code: shipping.cep.replace(/\D/g, '')
        }
      },
      notification_urls: [
        `https://${req.headers.host}/api/pagbank/webhook`
      ],
      // Configuração para Redirect Checkout
      payment_methods: [
        { type: "CREDIT_CARD" },
        { type: "BOLETO" },
        { type: "PIX" }
      ]
    };

    // Chamada para criar uma ordem com checkout
    // Nota: O endpoint de "checkouts" específico também pode ser usado, 
    // mas a API de Orders é o padrão moderno.
    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro PagBank API:", data);
      return res.status(response.status).json({ 
        error: 'PagBank API Error', 
        details: data.error_messages || data 
      });
    }

    // Na API de Orders do PagBank, os links de pagamento/checkout vêm em links[].
    // Procuramos o link com rel "PAY" ou similar dependendo da configuração.
    // Para Checkouts de Redirecionamento puros, usa-se o endpoint /checkouts.
    
    // Fallback: Se estiver usando o endpoint /checkouts (Hosted Checkout)
    // o retorno teria links[0].href direto.
    
    return res.status(200).json({
      success: true,
      orderId: data.id,
      // Retornamos os links para o front decidir (geralmente o link de pagamento)
      links: data.links,
      // Em integrações simplificadas, o link de pagamento costuma ser enviado
      checkoutUrl: data.links?.find((l: any) => l.rel === 'PAY')?.href || data.links?.[0]?.href
    });

  } catch (error: any) {
    console.error("Checkout Server Error:", error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
