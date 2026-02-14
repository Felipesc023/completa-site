import { CartItem } from '../types';

export interface ShippingOption {
  service: 'PAC' | 'SEDEX';
  price: number;
  days: number;
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

export const calculateShipping = (cep: string, items: CartItem[]): ShippingOption[] => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return [];

  // 1. Calcular Peso Total
  const totalWeight = items.reduce((acc, item) => acc + (item.weightKg || 0.3) * item.quantity, 0);
  
  // 2. Lógica de Região baseada no primeiro dígito do CEP (Simplificado para MVP)
  // 0-3: Sudeste, 4: MG/ES, 5: Nordeste (BA/SE), 6: Nordeste (restante), 7: Centro-Oeste/Norte, 8-9: Sul
  const firstDigit = parseInt(cleanCep[0]);
  
  let basePricePac = 20;
  let basePriceSedex = 35;
  let baseDaysPac = 5;
  let baseDaysSedex = 2;

  // Ajuste por região (Exemplo baseado saindo de SP - CEP 0xxxx)
  if (firstDigit >= 4 && firstDigit <= 6) { // Nordeste / MG
    basePricePac += 15;
    basePriceSedex += 25;
    baseDaysPac += 4;
    baseDaysSedex += 3;
  } else if (firstDigit === 7 || firstDigit === 8 || firstDigit === 9) { // Sul / Norte / CO
    basePricePac += 12;
    basePriceSedex += 20;
    baseDaysPac += 3;
    baseDaysSedex += 2;
  }

  // Ajuste por peso (R$ 5,00 por kg adicional após o primeiro kg)
  const weightExtra = Math.max(0, totalWeight - 1);
  const weightSurcharge = weightExtra * 5;

  return [
    {
      service: 'PAC',
      price: basePricePac + weightSurcharge,
      days: baseDaysPac
    },
    {
      service: 'SEDEX',
      price: basePriceSedex + weightSurcharge,
      days: baseDaysSedex
    }
  ];
};