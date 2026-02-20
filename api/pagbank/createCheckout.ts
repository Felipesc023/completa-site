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

export interface PagBankShipping {
  amount: {
    value: number;
  };
  address: {
    street: string;
    number: string;
    complement?: string;
    locality: string;
    city: string;
    region_code: string;
    postal_code: string;
  };
}

export interface PagBankOrderRequest {
  reference_id: string;
  customer: PagBankCustomer;
  items: PagBankItem[];
  deliveryMethod: "DELIVERY" | "PICKUP";
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
    const { reference_id, customer, items, deliveryMethod, notification_urls } = body;
    const shipping = body.shipping ?? null;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'O carrinho está vazio (items faltando).' });
    }

    if (!customer || !customer.name || !customer.email || !customer.tax_id) {
      return res.status(400).json({ success: false, error: 'Dados do cliente incompletos.' });
    }

    if (deliveryMethod === 'DELIVERY') {
      if (!shipping) {
        return res.status(400).json({ success: false, error: 'Dados de entrega (shipping) são obrigatórios para DELIVERY.' });
      }
      if (!shipping.cep || !shipping.street || !shipping.number || !shipping.neighborhood || !shipping.city || !shipping.state) {
        return res.status(400).json({ success: false, error: 'Endereço de entrega incompleto. Verifique CEP, rua, número, bairro, cidade e estado.' });
      }
    }

    const env = process.env.PAGBANK_ENV || 'sandbox';
    const token = process.env.PAGBANK_TOKEN;

    if (!token) {
      return res.status(500).json({ success: false, error: 'PAGBANK_TOKEN is not defined' });
    }

    const baseUrl = env === 'production' 
      ? 'https://api.pagseguro.com' 
      : 'https://sandbox.api.pagseguro.com';

    // Limpa o CPF (remove pontuação)
    const cleanCpf = customer.tax_id ? customer.tax_id.replace(/\D/g, '') : '';

    // Calcula automaticamente o total da order (items + shipping)
    const itemsTotal = items.reduce((acc, item) => acc + (item.unit_amount * item.quantity), 0);
    const shippingTotal = shipping?.price || 0;
    const totalValue = itemsTotal + shippingTotal;

    const payload: any = {
      reference_id,
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
    } else if (deliveryMethod === 'PICKUP') {
      // Envia um endereço padrão da loja para cumprir o schema se necessário,
      // ou apenas não envia o bloco shipping.address.
      // O PagBank permite order sem shipping se for serviço/digital, 
      // mas para produto físico pode exigir. Vamos enviar um endereço padrão da loja.
      payload.shipping = {
        amount: {
          currency: "BRL",
          value: 0
        },
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

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Tratamento robusto de erro retornando o raw error da API
    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        error: data 
      });
    }

    // Extrai o link de checkout (rel: "PAY" ou o primeiro disponível)
    let checkoutUrl = '';
    if (data.links && Array.isArray(data.links)) {
      const payLink = data.links.find((link: any) => link.rel === 'PAY');
      if (payLink) {
        checkoutUrl = payLink.href;
      } else if (data.links.length > 0) {
        checkoutUrl = data.links[0].href;
      }
    }

    return res.status(200).json({
      success: true,
      orderId: data.id,
      checkoutUrl
    });

  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    });
  }
}
