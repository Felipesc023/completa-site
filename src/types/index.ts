// ─── PRODUTO (compatível com estrutura atual do Firestore) ───────────────────

export interface Product {
  id: string
  name: string
  description: string
  composition?: string
  care?: string
  price: number
  promoPrice?: number | null
  salePrice?: number       // campo legado — usar promoPrice
  category: string
  brand?: string
  imageUrl: string         // imagem principal
  images?: string[]        // imagens adicionais
  colors: string[]
  sizes: string[]
  stock: number
  sku?: string
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  isActive: boolean
  isLaunch: boolean
  isBestSeller: boolean
  createdAt: Date | string
  updatedAt?: Date | string
  soldCount: number
}

// ─── CARRINHO ────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string
  name: string
  price: number
  promoPrice?: number | null
  selectedSize: string
  selectedColor: string
  imageUrl: string
  quantity: number
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

// ─── FRETE ───────────────────────────────────────────────────────────────────

export interface ShippingOption {
  id: string
  name: string
  price: number
  estimatedDays: number
  carrier?: string
}

export interface ShippingAddress {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

// ─── CHECKOUT ────────────────────────────────────────────────────────────────

export type CheckoutStep = 'cart' | 'identification' | 'delivery' | 'payment'
export type DeliveryType = 'delivery' | 'pickup'

export interface CheckoutCustomer {
  name: string
  email: string
  cpf: string
  phone: string
}

// ─── PEDIDO ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'aguardando_pagamento'
  | 'pago'
  | 'em_separacao'
  | 'enviado'
  | 'entregue'
  | 'cancelado'

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto'

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  size: string
  color: string
  imageUrl: string
}

export interface Order {
  id: string
  userId?: string
  customer: CheckoutCustomer
  deliveryType: DeliveryType
  address?: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shippingPrice: number
  total: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  pagbankOrderId?: string
  pixQrCode?: string
  pixCopyPaste?: string
  boletoUrl?: string
  createdAt: string
  paidAt?: string
  updatedAt?: string
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  photoURL?: string
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────

export interface Vitrine {
  id: string
  title: string
  subtitle?: string
  productIds: string[]
  isActive: boolean
  order: number
  createdAt: string
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type SortOption =
  | 'newest'
  | 'best_selling'
  | 'price_asc'
  | 'price_desc'
  | 'discount'

export interface FilterState {
  category: string[]
  colors: string[]
  sizes: string[]
  minPrice: number | ''
  maxPrice: number | ''
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function effectivePrice(
  product: Pick<Product, 'price' | 'promoPrice' | 'salePrice'>
): number {
  if (product.promoPrice != null && product.promoPrice > 0) return product.promoPrice
  if (product.salePrice != null && product.salePrice > 0) return product.salePrice
  return product.price
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14)
}

export function formatPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export function formatCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9)
}

// Gera URL jsDelivr a partir do nome do arquivo
export function jsDelivrUrl(filename: string): string {
  return `https://cdn.jsdelivr.net/gh/Felipesc023/completa-assets@main/public/products/${encodeURIComponent(filename)}`
}
