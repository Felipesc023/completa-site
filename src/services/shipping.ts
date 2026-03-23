import type { ShippingOption, CartItem } from '@/types'

// Tabela de preços base por região (R$)
const UF_BASE: Record<string, number> = {
  SP: 12, RJ: 15, MG: 15, ES: 17,
  PR: 17, SC: 17, RS: 19,
  GO: 20, DF: 20, MT: 22, MS: 22,
  BA: 22, SE: 24, AL: 24, PE: 24, PB: 24, RN: 25, CE: 25, PI: 26, MA: 26,
  PA: 28, AM: 32, RO: 30, AC: 35, RR: 35, AP: 35, TO: 27,
}

// Prazo base por região (dias úteis)
const UF_DAYS: Record<string, number> = {
  SP: 2, RJ: 3, MG: 3, ES: 4,
  PR: 4, SC: 4, RS: 5,
  GO: 5, DF: 4, MT: 6, MS: 5,
  BA: 6, SE: 7, AL: 7, PE: 7, PB: 7, RN: 8, CE: 7, PI: 8, MA: 8,
  PA: 9, AM: 12, RO: 10, AC: 14, RR: 14, AP: 12, TO: 8,
}

function extractUF(cep: string): string {
  const num = Number(cep.replace(/\D/g, ''))
  // Mapeamento aproximado de faixa de CEP → UF
  if (num >= 1000000  && num <= 19999999)  return 'SP'
  if (num >= 20000000 && num <= 28999999)  return 'RJ'
  if (num >= 29000000 && num <= 29999999)  return 'ES'
  if (num >= 30000000 && num <= 39999999)  return 'MG'
  if (num >= 40000000 && num <= 48999999)  return 'BA'
  if (num >= 49000000 && num <= 49999999)  return 'SE'
  if (num >= 50000000 && num <= 56999999)  return 'PE'
  if (num >= 57000000 && num <= 57999999)  return 'AL'
  if (num >= 58000000 && num <= 58999999)  return 'PB'
  if (num >= 59000000 && num <= 59999999)  return 'RN'
  if (num >= 60000000 && num <= 63999999)  return 'CE'
  if (num >= 64000000 && num <= 64999999)  return 'PI'
  if (num >= 65000000 && num <= 65999999)  return 'MA'
  if (num >= 66000000 && num <= 68899999)  return 'PA'
  if (num >= 68900000 && num <= 68999999)  return 'AP'
  if (num >= 69000000 && num <= 69299999)  return 'AM'
  if (num >= 69300000 && num <= 69399999)  return 'RR'
  if (num >= 69400000 && num <= 69899999)  return 'AM'
  if (num >= 69900000 && num <= 69999999)  return 'AC'
  if (num >= 70000000 && num <= 72999999)  return 'DF'
  if (num >= 73000000 && num <= 76999999)  return 'GO'
  if (num >= 77000000 && num <= 77999999)  return 'TO'
  if (num >= 78000000 && num <= 78899999)  return 'MT'
  if (num >= 78900000 && num <= 79999999)  return 'MS'
  if (num >= 80000000 && num <= 87999999)  return 'PR'
  if (num >= 88000000 && num <= 89999999)  return 'SC'
  if (num >= 90000000 && num <= 99999999)  return 'RS'
  if (num >= 76800000 && num <= 76999999)  return 'RO'
  return 'SP' // fallback
}

function totalWeight(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.weightKg * i.quantity, 0)
}

// Adicional por kg acima de 300g
function weightSurcharge(kg: number): number {
  if (kg <= 0.3) return 0
  return Math.ceil((kg - 0.3) / 0.1) * 0.8
}

export function calculateShipping(cep: string, items: CartItem[]): ShippingOption[] {
  const uf      = extractUF(cep)
  const base    = UF_BASE[uf] ?? 25
  const days    = UF_DAYS[uf] ?? 10
  const weight  = totalWeight(items)
  const surcharge = weightSurcharge(weight)

  const pac: ShippingOption = {
    id:            'pac',
    name:          'Entrega Padrão',
    carrier:       'Correios PAC',
    price:         Math.round((base + surcharge) * 100) / 100,
    estimatedDays: days,
  }

  const sedex: ShippingOption = {
    id:            'sedex',
    name:          'Entrega Expressa',
    carrier:       'Correios SEDEX',
    price:         Math.round((base * 1.8 + surcharge) * 100) / 100,
    estimatedDays: Math.max(1, Math.ceil(days * 0.4)),
  }

  return [pac, sedex]
}

// Busca endereço pelo CEP via ViaCEP (API pública, sem autenticação)
export async function fetchAddressByCEP(cep: string): Promise<{
  street: string
  neighborhood: string
  city: string
  state: string
} | null> {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null
  try {
    const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return {
      street:       data.logradouro ?? '',
      neighborhood: data.bairro     ?? '',
      city:         data.localidade ?? '',
      state:        data.uf         ?? '',
    }
  } catch {
    return null
  }
}
