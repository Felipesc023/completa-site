import { create } from 'zustand'
import type {
  CheckoutStep,
  CheckoutCustomer,
  DeliveryType,
  ShippingAddress,
  ShippingOption,
} from '@/types'

interface CheckoutStore {
  step: CheckoutStep
  customer: CheckoutCustomer | null
  deliveryType: DeliveryType
  address: ShippingAddress | null
  selectedShipping: ShippingOption | null

  setStep: (step: CheckoutStep) => void
  setCustomer: (customer: CheckoutCustomer) => void
  setDeliveryType: (type: DeliveryType) => void
  setAddress: (address: ShippingAddress) => void
  setSelectedShipping: (option: ShippingOption) => void
  reset: () => void
}

const INITIAL: Pick<
  CheckoutStore,
  'step' | 'customer' | 'deliveryType' | 'address' | 'selectedShipping'
> = {
  step: 'cart',
  customer: null,
  deliveryType: 'delivery',
  address: null,
  selectedShipping: null,
}

export const useCheckoutStore = create<CheckoutStore>()((set) => ({
  ...INITIAL,
  setStep:             (step)             => set({ step }),
  setCustomer:         (customer)         => set({ customer }),
  setDeliveryType:     (deliveryType)     => set({ deliveryType }),
  setAddress:          (address)          => set({ address }),
  setSelectedShipping: (selectedShipping) => set({ selectedShipping }),
  reset:               ()                 => set(INITIAL),
}))
