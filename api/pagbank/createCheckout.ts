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

    const { reference_id, customer, items, deliveryMethod, notification_urls } = body;
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
      payment_methods: [
        { type: "CREDIT_CARD" },
        { type: "PIX" },
        { type: "BOLETO" }
      ],
      notification_urls: notification_urls || []
    };

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
      // Para PICKUP ou quando não há endereço, enviamos o endereço da loja física
      // para cumprir o schema de Order do PagBank
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

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        error: data 
      });
    }

    // Extrai o link de checkout (rel: "PAY")
    let checkoutUrl = '';
    if (data.links && Array.isArray(data.links)) {
      const payLink = data.links.find((link: any) => link.rel === 'PAY');
      checkoutUrl = payLink ? payLink.href : (data.links[0]?.href || '');
    }

    return res.status(200).json({
      success: true,
      orderId: data.id,
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
