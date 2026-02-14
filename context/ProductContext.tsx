
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { db } from '../services/firebase';
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
    const sanitized: any = {};
    const numericFields = ['price', 'promoPrice', 'stock', 'weightKg', 'lengthCm', 'widthCm', 'heightCm'];
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value === undefined) return;

      if (numericFields.includes(key)) {
        if (value === null || value === '') {
            sanitized[key] = key === 'promoPrice' ? null : 0;
        } else {
            const numValue = typeof value === 'string' ? value.replace(',', '.') : value;
            sanitized[key] = parseFloat(numValue);
        }
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  };

  const addProduct = async (productData: any) => {
    try {
      const sanitized = sanitizeProductData({
        ...productData,
        soldCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'products'), sanitized);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    try {
      const sanitized = sanitizeProductData({
        ...productData,
        updatedAt: serverTimestamp()
      });

      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, sanitized);
    } catch (error) {
      console.error("Error updating product:", error);
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
