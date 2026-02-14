
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { db } from '../services/firebase';
// Fix: Import from firebase/firestore as a namespace to resolve "no exported member" errors.
import * as firestore from 'firebase/firestore';

const { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} = firestore;

interface ProductContextType {
  products: Product[];
  addProduct: (productData: any) => Promise<void>;
  updateProduct: (id: string, productData: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStatus: (id: string, field: 'isActive' | 'isLaunch' | 'isBestSeller') => Promise<void>;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        } as Product;
      });
      setProducts(productData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const sanitizeProductData = (data: any) => {
    console.log("payload:ready - Iniciando sanitização de dados");
    const sanitized: any = {};
    const numericFields = ['price', 'salePrice', 'stock', 'weightKg', 'lengthCm', 'widthCm', 'heightCm'];
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value === undefined) return;

      if (numericFields.includes(key)) {
        const numValue = typeof value === 'string' ? value.replace(',', '.') : value;
        sanitized[key] = numValue === '' ? 0 : parseFloat(numValue);
      } else {
        sanitized[key] = value;
      }
    });
    
    console.log("firestore:payload", sanitized);
    return sanitized;
  };

  const addProduct = async (productData: any) => {
    console.log("submit:start - Iniciando criação de produto via CDN");
    try {
      const sanitized = sanitizeProductData({
        ...productData,
        soldCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const docRef = await addDoc(collection(db, 'products'), sanitized);
      console.log(`firestore:success - ID: ${docRef.id}`);
    } catch (error) {
      console.error("firestore:fail", error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    try {
      console.log(`submit:start - Atualizando produto ${id}`);
      const sanitized = sanitizeProductData({
        ...productData,
        updatedAt: serverTimestamp()
      });

      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, sanitized);
      console.log("firestore:success - Produto atualizado");
    } catch (error) {
      console.error("firestore:fail", error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const toggleProductStatus = async (id: string, field: 'isActive' | 'isLaunch' | 'isBestSeller') => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await updateDoc(doc(db, 'products', id), {
          [field]: !(product as any)[field],
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error(`Error toggling ${field}:`, error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, toggleProductStatus, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
