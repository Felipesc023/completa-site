import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Order, OrderStatus } from '@/types'

const COLLECTION = 'orders'

function docToOrder(id: string, data: DocumentData): Order {
  return {
    id,
    userId:        data.userId,
    customer:      data.customer,
    deliveryType:  data.deliveryType,
    address:       data.address ?? undefined,
    items:         data.items ?? [],
    subtotal:      data.subtotal ?? 0,
    shippingPrice: data.shippingPrice ?? 0,
    total:         data.total ?? 0,
    paymentMethod: data.paymentMethod,
    status:        data.status,
    pagbankOrderId: data.pagbankOrderId,
    pixQrCode:     data.pixQrCode,
    pixCopyPaste:  data.pixCopyPaste,
    createdAt:     data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt ?? '',
    paidAt:        data.paidAt instanceof Timestamp
      ? data.paidAt.toDate().toISOString()
      : data.paidAt,
    updatedAt:     data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : data.updatedAt,
  }
}

export async function getAllOrders(): Promise<Order[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToOrder(d.id, d.data()))
}

export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToOrder(d.id, d.data()))
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: Timestamp.now(),
    ...(status === 'pago' ? { paidAt: Timestamp.now() } : {}),
  })
}

// Busca pedidos pelo email do cliente (usado na página do cliente)
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const q = query(
    collection(db, COLLECTION),
    where('customer.email', '==', email),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToOrder(d.id, d.data()))
}
