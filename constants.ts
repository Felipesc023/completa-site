
import { Product } from './types';

export const CATEGORIES = [
  { id: 'vestidos', name: 'Vestidos', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop' },
  { id: 'conjuntos', name: 'Conjuntos', image: 'https://images.unsplash.com/photo-1591369822096-35c93a188311?q=80&w=800&auto=format&fit=crop' },
  { id: 'blusas', name: 'Blusas', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=800&auto=format&fit=crop' },
  { id: 'calcas', name: 'Calças', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop' },
  { id: 'saias', name: 'Saias', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop' },
  { id: 'novidades', name: 'Novidades', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop' },
];

export const BRANDS = ["Completa Signature", "Urban Chic", "Soft Touch", "Elegance"];
export const COLORS = ["Preto", "Branco", "Off White", "Bege", "Azul", "Verde", "Rosa", "Marrom"];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Vestido Midi Linho",
    price: 389.90,
    category: "Vestidos",
    imageUrl: "https://cdn.jsdelivr.net/gh/Felipesc023/completa-assets@main/public/products/vestido_linho_1.jpg",
    description: "Vestido midi confeccionado em linho misto de alta qualidade. Possui decote quadrado, alças largas e fenda lateral.",
    sizes: ["P", "M", "G"],
    colors: ["Bege", "Off White"],
    brand: "Completa Signature",
    createdAt: "2024-03-01",
    soldCount: 150,
    isActive: true,
    isLaunch: true,
    isBestSeller: true,
    stock: 20,
    weightKg: 0.6,
    lengthCm: 30,
    widthCm: 20,
    heightCm: 5
  },
  {
    id: "2",
    name: "Blusa Seda Off-White",
    price: 299.90,
    // Fix: Renamed salePrice to promoPrice to match Product interface
    promoPrice: 249.90,
    category: "Blusas",
    imageUrl: "https://cdn.jsdelivr.net/gh/Felipesc023/completa-assets@main/public/products/blusa_seda_1.jpg",
    description: "Blusa em seda toque suave com caimento fluido. Decote V discreto e mangas 3/4.",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Off White", "Branco"],
    brand: "Soft Touch",
    createdAt: "2024-02-15",
    soldCount: 89,
    isActive: true,
    isLaunch: false,
    isBestSeller: false,
    stock: 15,
    weightKg: 0.3,
    lengthCm: 25,
    widthCm: 18,
    heightCm: 4
  }
];
