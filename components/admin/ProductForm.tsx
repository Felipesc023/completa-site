
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, Upload, RefreshCw, Package, Ruler, DollarSign, List, Image as ImageIcon } from 'lucide-react';
import { CATEGORIES, BRANDS } from '../../constants';

const ALL_SIZES = ["PP", "P", "M", "G", "GG", "36", "38", "40", "42", "44"];

export const AdminProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { products, addProduct, updateProduct } = useProducts();
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '', 
    promoPrice: '',
    category: 'Vestidos',
    brand: BRANDS[0],
    imageUrl: '',
    sizes: [] as string[],
    colors: [] as string[],
    stock: '1',
    weightKg: '0.3',
    lengthCm: '25',
    widthCm: '18',
    heightCm: '4',
    isActive: true,
    isLaunch: false,
    isBestSeller: false
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            promoPrice: product.promoPrice?.toString() || '',
            category: product.category || 'Vestidos',
            brand: product.brand || BRANDS[0],
            imageUrl: product.imageUrl || '',
            sizes: product.sizes || [],
            colors: product.colors || [],
            stock: product.stock?.toString() || '1',
            weightKg: product.weightKg?.toString() || '0.3',
            lengthCm: product.lengthCm?.toString() || '25',
            widthCm: product.widthCm?.toString() || '18',
            heightCm: product.heightCm?.toString() || '4',
            isActive: product.isActive ?? true,
            isLaunch: product.isLaunch ?? false,
            isBestSeller: product.isBestSeller ?? false
        });
        if (product.imageUrl) setLocalPreview(product.imageUrl);
      }
    }
  }, [id, isEditing, products]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: 'sizes' | 'colors', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const newArray = current.includes(value) 
        ? current.filter(item => item !== value) 
        : [...current, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLocalPreview(previewUrl);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const uploadViaInternalApi = async (file: File): Promise<string> => {
    setUploadProgress(true);
    try {
      const base64Content = await fileToBase64(file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file: base64Content,
          fileName: file.name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha no upload via API');
      }

      const data = await response.json();
      return data.imageUrl;
    } finally {
      setUploadProgress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    // Validação básica
    if (formData.promoPrice && parseFloat(formData.promoPrice) >= parseFloat(formData.price)) {
        alert("O preço promocional deve ser menor que o preço original.");
        return;
    }

    setIsSubmitting(true);
    try {
        let finalImageUrl = formData.imageUrl;

        if (selectedFile) {
            finalImageUrl = await uploadViaInternalApi(selectedFile);
        }

        const productDataToSave = { 
            ...formData, 
            imageUrl: finalImageUrl,
            price: parseFloat(formData.price),
            promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : null,
            stock: parseInt(formData.stock),
            weightKg: parseFloat(formData.weightKg),
            lengthCm: parseFloat(formData.lengthCm),
            widthCm: parseFloat(formData.widthCm),
            heightCm: parseFloat(formData.heightCm)
        };

        if (isEditing && id) {
            await updateProduct(id, productDataToSave);
        } else {
            await addProduct(productDataToSave);
        }
        
        navigate('/admin/products');
    } catch (error: any) {
        alert(`Ocorreu um erro: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/products')} className="text-stone-400 hover:text-brand-dark transition-colors p-1">
            <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-3xl font-serif text-brand-dark">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>
            <p className="text-stone-500 text-sm font-light uppercase tracking-widest mt-1">Completa Admin Hub</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-4 mb-6">
                    <List className="text-brand-gold" size={20} />
                    <h2 className="font-serif text-xl text-brand-dark">Informações Básicas</h2>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Nome do Produto</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-gold/50 transition-all text-brand-dark" />
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Descrição</label>
                    <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-gold/50 transition-all text-brand-dark resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Categoria</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm text-brand-dark appearance-none">
                            {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Marca</label>
                        <select name="brand" value={formData.brand} onChange={handleChange} className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm text-brand-dark appearance-none">
                            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Preço e Estoque */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-4 mb-6">
                    <DollarSign className="text-brand-gold" size={20} />
                    <h2 className="font-serif text-xl text-brand-dark">Preço e Estoque</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Preço (R$)</label>
                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm text-brand-dark" placeholder="0,00" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Promocional (R$)</label>
                        <input type="number" step="0.01" name="promoPrice" value={formData.promoPrice} onChange={handleChange} className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm text-brand-dark" placeholder="Opcional" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Estoque Atual</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm text-brand-dark" />
                    </div>
                </div>
            </div>

            {/* Logística */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-4 mb-6">
                    <Package className="text-brand-gold" size={20} />
                    <h2 className="font-serif text-xl text-brand-dark">Logística (Correios)</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Peso (Kg)</label>
                        <input type="number" step="0.1" name="weightKg" value={formData.weightKg} onChange={handleChange} required className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm text-brand-dark" />
                        <span className="text-[9px] text-stone-400">Ex: 0.3 blusas / 0.6 vestidos</span>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Comp. (cm)</label>
                        <input type="number" name="lengthCm" value={formData.lengthCm} onChange={handleChange} required className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm text-brand-dark" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Larg. (cm)</label>
                        <input type="number" name="widthCm" value={formData.widthCm} onChange={handleChange} required className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm text-brand-dark" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Alt. (cm)</label>
                        <input type="number" name="heightCm" value={formData.heightCm} onChange={handleChange} required className="w-full p-3 bg-stone-50 border border-transparent rounded-lg text-sm text-brand-dark" />
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            {/* Mídia */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
                    <ImageIcon className="text-brand-gold" size={20} />
                    <h2 className="font-serif text-xl text-brand-dark">Mídia</h2>
                </div>
                
                <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-stone-50 hover:bg-stone-100 transition-all cursor-pointer group relative overflow-hidden min-h-[200px] ${localPreview ? 'border-brand-gold' : 'border-stone-200'}`}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    {localPreview ? (
                        <div className="relative w-full aspect-[3/4]">
                            <img src={localPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <RefreshCw size={24} className="text-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Selecionar Foto</p>
                        </div>
                    )}
                    {uploadProgress && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20">
                            <RefreshCw className="w-8 h-8 text-brand-gold animate-spin" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mt-2">Enviando...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Variantes */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
                    <Ruler className="text-brand-gold" size={20} />
                    <h2 className="font-serif text-xl text-brand-dark">Tamanhos</h2>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {ALL_SIZES.map(size => (
                        <button 
                            key={size} 
                            type="button" 
                            onClick={() => handleArrayChange('sizes', size)} 
                            className={`py-3 text-[10px] rounded-lg border font-bold transition-all ${formData.sizes.includes(size) ? 'bg-brand-dark text-white border-brand-dark shadow-md' : 'bg-white text-stone-400 border-stone-200 hover:border-brand-gold'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting || uploadProgress} 
                className="w-full bg-brand-brown text-white py-5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-dark disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
            >
                {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <><Save size={18} /> Salvar Produto</>}
            </button>
        </div>
      </form>
    </div>
  );
};
