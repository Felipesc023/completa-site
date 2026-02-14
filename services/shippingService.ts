
import { CartItem } from '../types';

export interface ShippingOption {
  service: string;
  price: number;
  days: number;
  isFree?: boolean;
}

export const getAddressByCep = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (data.erro) return null;
    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
};

export const calculateShipping = (cep: string, items: CartItem[], subtotal: number): ShippingOption => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return { service: 'Indisponível', price: 0, days: 0 };

  // 1. Frete Grátis
  if (subtotal >= 199) {
    return {
      service: 'Frete Grátis (Padrão)',
      price: 0,
      days: 5,
      isFree: true
    };
  }

  // 2. Base por UF
  const firstDigit = parseInt(cleanCep[0]);
  const ufCode = parseInt(cleanCep.substring(0, 2));
  
  let basePrice = 24; // Padrão demais regiões
  let days = 7;

  // São Paulo (01-19)
  if (ufCode >= 1 && ufCode <= 19) {
    basePrice = 14;
    days = 2;
  } 
  // RJ, MG, PR, SC, RS
  else if (
    (ufCode >= 20 && ufCode <= 28) || // RJ
    (ufCode >= 30 && ufCode <= 39) || // MG
    (ufCode >= 80 && ufCode <= 87) || // PR
    (ufCode >= 88 && ufCode <= 89) || // SC
    (ufCode >= 90 && ufCode <= 99)    // RS
  ) {
    basePrice = 19;
    days = 4;
  }

  // 3. Adicional por volume (R$ 2 a cada 3 itens)
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const volumeSurcharge = Math.floor(totalItems / 3) * 2;

  return {
    service: 'Entrega Padrão',
    price: basePrice + volumeSurcharge,
    days: days
  };
};
