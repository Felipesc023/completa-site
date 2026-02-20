
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
  try {
    const response = await fetch('/api/pagbank/createCheckout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao processar checkout no PagBank');
    }

    return data;
  } catch (error: any) {
    console.error("PagBank Service Error:", error);
    throw error;
  }
};
