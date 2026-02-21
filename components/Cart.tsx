
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, CreditCard, Minus, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { items, removeFromCart, updateCartItemQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cep, setCep] = useState('');
  const [shippingResult, setShippingResult] = useState<{ price: number; time: string } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const handleCheckout = async () => {
    if (!shippingResult) {
      alert("Por favor, calcule o frete antes de finalizar.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          customer: {
            name: user?.name,
            email: user?.email,
          },
          items: items.map(i => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.promoPrice || i.price,
            selectedSize: i.selectedSize,
            selectedColor: i.selectedColor
          })),
          shipping: shippingResult,
          total: cartTotal + (shippingResult?.price || 0)
        })
      });

      if (!response.ok) throw new Error("Erro no checkout");
      
      const data = await response.json();
      console.log("Checkout structure ready:", data);
      alert("Estrutura de checkout preparada! Integração com PagSeguro pendente.");
      
    } catch (error) {
      console.error("Erro ao finalizar:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCalculateShipping = async () => {
    if (cep.length < 8) {
      setShippingError('CEP inválido');
      return;
    }

    setShippingLoading(true);
    setShippingError('');
    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cepDestino: cep,
          products: items.map(i => ({
            weight: i.weightKg,
            height: i.heightCm,
            width: i.widthCm,
            length: i.lengthCm,
            quantity: i.quantity
          }))
        })
      });

      if (!response.ok) throw new Error("Falha no cálculo de frete");
      
      const data = await response.json();
      setShippingResult({ price: data.price, time: data.delivery_time });
    } catch (error) {
      console.error(error);
      setShippingError('Erro ao calcular frete. Tente novamente.');
    } finally {
      setShippingLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 pb-40 text-center animate-fade-in">
        <ShoppingBag size={48} className="mx-auto text-stone-200 mb-6" />
        <h2 className="font-serif text-3xl text-brand-dark mb-4">Seu carrinho está vazio</h2>
        <button onClick={() => navigate('/shop')} className="bg-brand-dark text-white px-8 py-3 uppercase text-xs tracking-widest hover:bg-brand-gold transition-all">Explorar Loja</button>
      </div>
    );
  }

  const finalTotal = cartTotal + (shippingResult?.price || 0);

  return (
    <div className="pt-8 pb-20 bg-white min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl text-brand-dark mb-12 text-center">Sacola de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* List Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="hidden md:grid grid-cols-5 text-[10px] uppercase tracking-widest font-bold text-stone-400 pb-4 border-b border-stone-100 px-4">
              <div className="col-span-2">Produto</div>
              <div className="text-center">Quantidade</div>
              <div className="text-center">Preço Unit.</div>
              <div className="text-right">Subtotal</div>
            </div>

            {items.map((item, idx) => (
              <div key={`${item.id}-${item.selectedSize}-${idx}`} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-stone-100 rounded-sm bg-white items-center">
                <div className="col-span-2 flex gap-4">
                  <div className="w-16 h-20 bg-stone-50 rounded-sm overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-brand-dark">{item.name}</h3>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">TAM: {item.selectedSize}</p>
                    {/* Fix: Added required color argument to removeFromCart */}
                    <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="text-stone-300 hover:text-red-500 transition-colors mt-2 flex items-center gap-1 text-[10px] uppercase font-bold tracking-tighter">
                      <Trash2 size={12}/> Remover
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center gap-2 border border-stone-200 rounded p-1">
                    {/* Fix: Added required color argument to updateCartItemQuantity */}
                    <button onClick={() => updateCartItemQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)} className="p-1 hover:bg-stone-50 text-stone-500"><Minus size={12}/></button>
                    <span className="text-xs w-6 text-center">{item.quantity}</span>
                    {/* Fix: Added required color argument to updateCartItemQuantity */}
                    <button onClick={() => updateCartItemQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)} className="p-1 hover:bg-stone-50 text-stone-500"><Plus size={12}/></button>
                  </div>
                </div>

                <div className="text-center text-xs text-stone-500">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.promoPrice || item.price)}
                </div>

                <div className="text-right font-medium text-brand-dark">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((item.promoPrice || item.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            <div className="bg-white p-6 border border-stone-100 shadow-xl">
              <h2 className="font-serif text-xl mb-6 text-brand-dark border-b border-stone-50 pb-4">Resumo do Pedido</h2>

              {/* Shipping Section */}
              <div className="mb-8 space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Calcular Frete</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="CEP: 00000-000" 
                    maxLength={8}
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                    className="flex-grow p-2 border border-stone-200 text-sm focus:outline-none focus:border-brand-gold bg-stone-50"
                  />
                  <button 
                    onClick={handleCalculateShipping}
                    disabled={shippingLoading}
                    className="px-4 py-2 bg-brand-dark text-white text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-50"
                  >
                    {shippingLoading ? <RefreshCw className="animate-spin" size={12}/> : 'Calcular'}
                  </button>
                </div>
                {shippingError && <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle size={10}/> {shippingError}</p>}
                
                {shippingResult && (
                  <div className="bg-green-50 p-2 border border-green-100 text-[10px] text-green-700 rounded-sm">
                    Frete: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingResult.price)} - Entrega em {shippingResult.time}
                  </div>
                )}
              </div>

              <div className="space-y-4 text-sm font-light text-stone-500 border-b border-stone-50 pb-6 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Frete</span>
                  {shippingResult ? (
                    <span className="text-brand-dark font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingResult.price)}</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded text-stone-400 border border-stone-200">A calcular</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between text-brand-dark font-bold text-xl mb-8">
                <span>Total</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotal)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isProcessing || !shippingResult}
                className="w-full bg-brand-gold text-white py-4 uppercase text-xs tracking-widest font-bold hover:bg-brand-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {isProcessing ? 'Processando...' : <><CreditCard size={16} /> Ir para Pagamento</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
