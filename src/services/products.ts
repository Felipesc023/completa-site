import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Product, FilterState, SortOption } from '@/types'

const COLLECTION = 'products'

// Converte documento Firestore → Product tipado
function docToProduct(id: string, data: DocumentData): Product {
  return {
    id,
    name: data.name ?? '',
    description: data.description ?? '',
    composition: data.composition,
    care: data.care,
    price: data.price ?? 0,
    promoPrice: data.promoPrice ?? null,
    salePrice: data.salePrice ?? 0,
    category: data.category ?? '',
    brand: data.brand,
    imageUrl: data.imageUrl ?? '',
    images: data.images ?? [],
    colors: data.colors ?? [],
    sizes: data.sizes ?? [],
    stock: data.stock ?? 0,
    sku: data.sku,
    weightKg: data.weightKg ?? 0,
    lengthCm: data.lengthCm ?? 0,
    widthCm: data.widthCm ?? 0,
    heightCm: data.heightCm ?? 0,
    isActive: data.isActive ?? true,
    isLaunch: data.isLaunch ?? false,
    isBestSeller: data.isBestSeller ?? false,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt ?? '',
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : data.updatedAt,
    soldCount: data.soldCount ?? 0,
  }
}

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export async function getProducts(
  filters?: Partial<FilterState>,
  sort?: SortOption
): Promise<Product[]> {
  // Busca todos os produtos ativos sem ordenação no Firestore
  // (evita exigir índice composto que pode não existir)
  const q = query(
    collection(db, COLLECTION),
    where('isActive', '==', true)
  )
  const snap = await getDocs(q)
  let products = snap.docs.map((d) => docToProduct(d.id, d.data()))

  // Ordenação client-side
  switch (sort) {
    case 'newest':
      products.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      break
    case 'best_selling':
      products.sort((a, b) => b.soldCount - a.soldCount)
      break
    case 'price_asc':
      products.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      products.sort((a, b) => b.price - a.price)
      break
  }

  // Filtros client-side (Firestore tem limitações com múltiplos where+orderBy)
  if (filters) {
    if (filters.category && filters.category.length > 0) {
      products = products.filter((p) => filters.category!.includes(p.category))
    }
    if (filters.colors && filters.colors.length > 0) {
      products = products.filter((p) =>
        p.colors.some((c) => filters.colors!.includes(c))
      )
    }
    if (filters.sizes && filters.sizes.length > 0) {
      products = products.filter((p) =>
        p.sizes.some((s) => filters.sizes!.includes(s))
      )
    }
    if (filters.minPrice !== '' && filters.minPrice != null) {
      products = products.filter((p) => p.price >= (filters.minPrice as number))
    }
    if (filters.maxPrice !== '' && filters.maxPrice != null) {
      products = products.filter((p) => p.price <= (filters.maxPrice as number))
    }
  }

  // Filtro de desconto
  if (sort === 'discount') {
    products = products
      .filter((p) => p.promoPrice != null && p.promoPrice > 0)
      .sort((a, b) => {
        const discA = ((a.price - (a.promoPrice ?? a.price)) / a.price)
        const discB = ((b.price - (b.promoPrice ?? b.price)) / b.price)
        return discB - discA
      })
  }

  return products
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return docToProduct(snap.id, snap.data())
}

export async function getFeaturedProducts(max = 8): Promise<Product[]> {
  const q = query(
    collection(db, COLLECTION),
    where('isActive', '==', true),
    where('isBestSeller', '==', true),
    orderBy('soldCount', 'desc'),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToProduct(d.id, d.data()))
}

export async function getNewArrivals(max = 8): Promise<Product[]> {
  const q = query(
    collection(db, COLLECTION),
    where('isActive', '==', true),
    where('isLaunch', '==', true),
    orderBy('createdAt', 'desc'),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToProduct(d.id, d.data()))
}

// Busca todas as categorias únicas dos produtos ativos
export async function getCategories(): Promise<string[]> {
  const q = query(
    collection(db, COLLECTION),
    where('isActive', '==', true)
  )
  const snap = await getDocs(q)
  const cats = new Set<string>()
  snap.docs.forEach((d) => {
    const cat = d.data().category as string
    if (cat) cats.add(cat)
  })
  return Array.from(cats).sort()
}

// ─── ADMIN — ESCRITA ─────────────────────────────────────────────────────────

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'soldCount'>
): Promise<string> {
  // Remove undefined — Firestore não aceita esse valor
  const clean = Object.fromEntries(
    Object.entries({
      ...data,
      soldCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }).filter(([, v]) => v !== undefined)
  )
  const ref = await addDoc(collection(db, COLLECTION), clean)
  return ref.id
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<void> {
  // Remove undefined — Firestore não aceita esse valor
  const clean = Object.fromEntries(
    Object.entries({ ...data, updatedAt: Timestamp.now() })
      .filter(([, v]) => v !== undefined)
  )
  await updateDoc(doc(db, COLLECTION, id), clean)
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}

// Admin — lista todos os produtos (ativos e inativos)
export async function getAllProductsAdmin(): Promise<Product[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToProduct(d.id, d.data()))
}
