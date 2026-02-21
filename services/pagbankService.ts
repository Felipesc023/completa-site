
/**
 * Serviço de integração com o PagBank (PagSeguro).
 * Faz a ponte com as serverless functions para manter o token seguro.
 */
export const createPagBankCheckout = async (orderData: {
  items: any[];
  customer: {
    name: string;
    email: string;
    phone: string;
    tax_id: string;
  };
  deliveryMethod: "DELIVERY" | "PICKUP";
  paymentPreference?: 'credit_card' | 'pix' | 'boleto';
  shipping: {
    price: number;
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  referenceId?: string;
}) => {
  // Validação defensiva antes de enviar para o backend
  if (orderData.deliveryMethod === "DELIVERY") {
    const s = orderData.shipping;
    if (!s.cep || !s.street || !s.number || !s.neighborhood || !s.city || !s.state) {
      throw new Error("Preencha o endereço completo para entrega.");
    }
  }

  try {
    const response = await fetch('/api/pagbank/createCheckout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      // Retorna uma mensagem amigável sem citar o provedor
      const errorMsg = typeof data.error === 'string' 
        ? data.error 
        : (data.error?.message || 'Não foi possível iniciar o pagamento. Tente novamente.');
      throw new Error(errorMsg);
    }

    return {
      success: data.success ?? true,
      checkoutUrl: data.checkoutUrl,
      orderId: data.orderId,
      paymentType: data.paymentType,
      pixCode: data.pixCode,
      qrCodeBase64: data.qrCodeBase64,
      expiration: data.expiration
    };
  } catch (error: any) {
    console.error("Checkout Service Error:", error);
    throw error;
  }
};
