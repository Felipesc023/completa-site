export interface VercelRequest {
  method?: string;
  body: any;
  query: { [key: string]: string | string[] };
  cookies: { [key: string]: string };
}

export interface VercelResponse {
  status(statusCode: number): VercelResponse;
  json(body: any): void;
  send(body: any): void;
}

export interface PagBankItem {
  reference_id: string;
  name: string;
  quantity: number;
  unit_amount: number;
}

export interface PagBankCustomer {
  name: string;
  email: string;
  tax_id: string;
  phones: Array<{
    country: string;
    area: string;
    number: string;
    type: string;
  }>;
}

export interface PagBankOrderRequest {
  reference_id: string;
  customer: PagBankCustomer;
  items: PagBankItem[];
  deliveryMethod: "DELIVERY" | "PICKUP";
  paymentPreference?: 'credit_card' | 'pix' | 'boleto';
  shipping?: {
    price: number;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  notification_urls?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = req.body as PagBankOrderRequest;
    
    // Validação defensiva inicial
    if (!body) {
      return res.status(400).json({ success: false, error: 'Corpo da requisição vazio.' });
    }

    const { reference_id, customer, items, deliveryMethod, notification_urls, paymentPreference } = body;
    const shipping = body.shipping ?? null;

    // 1. Validação de Itens
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'O carrinho está vazio ou os itens são inválidos.' });
    }

    // 2. Validação de Cliente
    if (!customer || !customer.name || !customer.email || !customer.tax_id) {
      return res.status(400).json({ success: false, error: 'Dados do cliente (nome, email, CPF) são obrigatórios para prosseguir.' });
    }

    // 3. Validação de Entrega
    if (deliveryMethod === 'DELIVERY') {
      if (!shipping) {
        return res.status(400).json({ success: false, error: 'Dados de entrega são obrigatórios para o método de entrega selecionado.' });
      }
      // Checagem campo a campo para evitar "Cannot read properties of undefined"
      if (!shipping.cep || !shipping.street || !shipping.number || !shipping.neighborhood || !shipping.city || !shipping.state) {
        return res.status(400).json({ success: false, error: 'Endereço de entrega incompleto. Por favor, verifique todos os campos de endereço.' });
      }
    }

    const env = process.env.PAGBANK_ENV || 'sandbox';
    const token = process.env.PAGBANK_TOKEN;

    if (!token) {
      return res.status(500).json({ success: false, error: 'Erro de configuração no servidor. Por favor, tente novamente mais tarde.' });
    }

    const baseUrl = env === 'production' 
      ? 'https://api.pagseguro.com' 
      : 'https://sandbox.api.pagseguro.com';

    // Limpa o CPF (remove pontuação)
    const cleanCpf = customer.tax_id.replace(/\D/g, '');

    // Calcula automaticamente o total da order (items + shipping)
    const itemsTotal = items.reduce((acc, item) => acc + (item.unit_amount * item.quantity), 0);
    const shippingTotal = shipping?.price || 0;
    const totalValue = itemsTotal + shippingTotal;

    const payload: any = {
      reference_id: reference_id || `ORDER_${Date.now()}`,
      customer: {
        name: customer.name,
        email: customer.email,
        tax_id: cleanCpf,
        phones: customer.phones || []
      },
      items: items.map(item => ({
        reference_id: item.reference_id,
        name: item.name,
        quantity: item.quantity,
        unit_amount: item.unit_amount
      })),
      amount: {
        currency: "BRL",
        value: totalValue
      },
      notification_urls: notification_urls || []
    };

    // Se NÃO for PIX, usamos Hosted Checkout (payment_methods no Order)
    if (paymentPreference !== 'pix') {
      payload.payment_methods = [
        { type: "CREDIT_CARD" },
        { type: "BOLETO" }
      ];
    }

    // Configuração do bloco Shipping no payload do PagBank
    if (deliveryMethod === 'DELIVERY' && shipping) {
      payload.shipping = {
        amount: {
          currency: "BRL",
          value: shippingTotal
        },
        address: {
          street: shipping.street,
          number: shipping.number,
          complement: shipping.complement || "",
          locality: shipping.neighborhood,
          city: shipping.city,
          region_code: shipping.state,
          country: "BRA",
          postal_code: shipping.cep ? shipping.cep.replace(/\D/g, '') : ''
        }
      };
    } else {
      payload.shipping = {
        amount: { currency: "BRL", value: 0 },
        address: {
          street: "Rua Barão do Amazonas",
          number: "730",
          complement: "Centro",
          locality: "Centro",
          city: "Ribeirão Preto",
          region_code: "SP",
          country: "BRA",
          postal_code: "14010120"
        }
      };
    }

    // 1. Criar a Order
    const orderResponse = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      return res.status(orderResponse.status).json({ success: false, error: orderData });
    }

    // 2. Se for PIX, criar a Charge
    if (paymentPreference === 'pix') {
      const chargePayload = {
        payment_method: {
          type: "PIX",
          pix: {
            expires_in: 1800 // 30 minutos
          }
        }
      };

      const chargeResponse = await fetch(`${baseUrl}/orders/${orderData.id}/charges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(chargePayload)
      });

      const chargeData = await chargeResponse.json();

      if (!chargeResponse.ok) {
        return res.status(chargeResponse.status).json({ success: false, error: chargeData });
      }

      // Extrai dados do PIX
      const pixInfo = chargeData.payment_method?.pix;
      const qrCode = chargeData.links?.find((l: any) => l.media === 'image/png')?.href;
      const pixCode = pixInfo?.qrcode;
      const expiration = pixInfo?.expiration_date;

      return res.status(200).json({
        success: true,
        orderId: orderData.id,
        paymentType: 'PIX',
        pixCode,
        qrCodeBase64: qrCode, // O PagBank retorna link ou base64 dependendo da config, mas aqui tratamos como o que vier
        expiration
      });
    }

    // 3. Se for Cartão ou Boleto, extrair checkoutUrl (Hosted Checkout)
    let checkoutUrl = '';
    if (orderData.links && Array.isArray(orderData.links)) {
      const payLink = 
        orderData.links.find((link: any) => link.rel === 'PAY') || 
        orderData.links.find((link: any) => link.rel === 'CHECKOUT') ||
        orderData.links[0];
        
      checkoutUrl = payLink ? payLink.href : '';
    }

    if (!checkoutUrl) {
      return res.status(500).json({
        success: false,
        error: 'Não foi possível gerar o link de pagamento. Por favor, tente novamente.'
      });
    }

    return res.status(200).json({
      success: true,
      orderId: orderData.id,
      checkoutUrl
    });

  } catch (error: any) {
    console.error("PagBank API Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno no servidor ao processar o checkout.' 
    });
  }
}
