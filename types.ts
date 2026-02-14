
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number; // Renomeado de salePrice
  category: string;
  brand?: string;
  imageUrl: string;
  sizes: string[];
  colors: string[];
  stock: number;
  
  // Logística (Correios)
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  
  // Status flags
  isActive: boolean;
  isLaunch: boolean;
  isBestSeller: boolean;
  
  createdAt: string | any;
  updatedAt?: string | any;
  soldCount: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

export type OrderStatus = 'aguardando_pagamento' | 'pago' | 'cancelado' | 'enviado';

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    size: string;
  }[];
  shipping: {
    service: string;
    price: number;
    days: number;
  };
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentLink?: string;
  createdAt: string;
  paidAt?: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type SortOption = 'newest' | 'best_selling' | 'price_asc' | 'price_desc' | 'relevance' | 'discount';

export interface FilterState {
  category: string[];
  colors: string[];
  sizes: string[];
  brands: string[];
  minPrice: number | '';
  maxPrice: number | '';
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
}
