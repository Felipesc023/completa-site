import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]

  // Adiciona item — agrega quantidade se já existir mesmo produto+cor+tamanho
  addItem: (item: CartItem) => void

  // Atualiza quantidade de um item específico
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void

  // Remove item do carrinho
  removeItem: (productId: string, color: string, size: string) => void

  // Limpa o carrinho inteiro
  clearCart: () => void

  // Drawer state
  isOpen: boolean
  openCart: () => void
  closeCart: () => void

  // Derivados (computed)
  totalItems: () => number
  subtotal: () => number
}

// Chave única para identificar um item no carrinho
function itemKey(productId: string, color: string, size: string): string {
  return `${productId}::${color}::${size}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const { items } = get()
        const key = itemKey(newItem.productId, newItem.selectedColor, newItem.selectedSize)
        const existing = items.find(
          (i) => itemKey(i.productId, i.selectedColor, i.selectedSize) === key
        )

        if (existing) {
          // Agrega quantidade em vez de duplicar linha
          set({
            items: items.map((i) =>
              itemKey(i.productId, i.selectedColor, i.selectedSize) === key
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...items, newItem] })
        }
      },

      updateQuantity: (productId, color, size, quantity) => {
        if (quantity < 1) return // não permite zerar via updateQuantity
        const key = itemKey(productId, color, size)
        set({
          items: get().items.map((i) =>
            itemKey(i.productId, i.selectedColor, i.selectedSize) === key
              ? { ...i, quantity }
              : i
          ),
        })
      },

      removeItem: (productId, color, size) => {
        const key = itemKey(productId, color, size)
        set({
          items: get().items.filter(
            (i) => itemKey(i.productId, i.selectedColor, i.selectedSize) !== key
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const price = i.promoPrice != null && i.promoPrice > 0 ? i.promoPrice : i.price
          return sum + price * i.quantity
        }, 0),
    }),
    {
      name: 'completa-cart',
      storage: createJSONStorage(() => localStorage),
      // Persiste apenas os itens — estado do drawer não precisa persistir
      partialize: (state) => ({ items: state.items }),
    }
  )
)
