
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import * as firestore from 'firebase/firestore';
import { ShoppingBag, Trash2, Truck, MessageCircle, Info } from 'lucide-react';
import { getAddressByCep, calculateShipping, ShippingOption } from '../services/shippingService';
import { useNavigate } from 'react-router-dom';

const { collection, addDoc } = firestore;

export const Cart: React.FC = () => {
  const { items, removeFromCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<any>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');

  const freeShippingThreshold = 199;
  const remainingForFree = Math.max(0, freeShippingThreshold - cartTotal);

  useEffect(() => {
    if (cep.length === 8) {
      handleCepLookup();
    }
  }, [cep, cartTotal]);

  const handleCepLookup = async () => {
    setIsCalculating(true);
    const addr = await getAddressByCep(cep);
    if (addr) {
      setAddress(addr);
      const option = calculateShipping(cep, items, cartTotal);
      setShippingOption(option);
    } else {
      setAddress(null);
      setShippingOption(null);
    }
    setIsCalculating(false);
  };

  const handleFinalize = async () => {
    if (!shippingOption || !address || !addressNumber) {
      alert("Por favor, preencha o CEP e o número do endereço.");
      return;
    }

    setIsProcessing(true);
    try {
      const shippingPrice = shippingOption.price;
      const total = cartTotal + shippingPrice;

      const orderData = {
        userId: user?.id || null,
        customerName: user?.name || 'Cliente Site',
        customerPhone: '',
        customerEmail: user?.email || '',
        address: {
          cep: cep,
          street: address.logradouro,
          number: addressNumber,
          complement: addressComplement,
          neighborhood: address.bairro,
          city: address.localidade,
          state: address.uf
        },
        items: items.map(i => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.promoPrice || i.price,
          size: i.selectedSize
        })),
        shipping: {
          service: shippingOption.service,
          price: shippingPrice,
          days: shippingOption.days
        },
        subtotal: cartTotal,
        total,
        status: 'aguardando_pagamento' as const,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      const resumoItens = items.map(i => `- ${i.name} (${i.selectedSize}) x${i.quantity}: R$ ${(i.promoPrice || i.price).toFixed(2)}`).join('%0A');
      const mensagem = `Olá Completa! Acabei de fazer um pedido no site.%0A%0A*Resumo do Pedido:*%0A${resumoItens}%0A%0A*Logística:*%0A- Frete: ${shippingOption.service} (${shippingOption.days} dias)%0A- Endereço: ${address.logradouro}, ${addressNumber} - ${address.localidade}/${address.uf}%0A%0A*Total: R$ ${total.toFixed(2)}*%0A%0APor favor, me envie o link para pagamento.`;
      
      const whatsappUrl = `https://wa.me/5516988289153?text=${mensagem}`;
      window.open(whatsappUrl, '_blank');
      
      navigate('/');
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      alert("Erro ao processar pedido.");
    } finally {
      setIsProcessing(false);
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

  return (
    <div className="pt-8 pb-20 bg-white min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl text-brand-dark mb-12 text-center">Sacola de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 p-4 border border-stone-100 rounded-sm bg-white">
                <div className="w-24 h-32 bg-stone-50 rounded-sm overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-brand-dark">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Tam: {item.selectedSize}</p>
                  <p className="text-sm font-medium text-brand-dark mt-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.promoPrice || item.price)}
                  </p>
                </div>
              </div>
            ))}

            {remainingForFree > 0 ? (
                <div className="bg-brand-beige/30 p-4 border border-brand-gold/20 flex items-center gap-3">
                    <Info size={18} className="text-brand-gold" />
                    <p className="text-xs text-stone-600">
                        Faltam <span className="font-bold">R$ {remainingForFree.toFixed(2)}</span> para você ganhar <span className="text-brand-gold font-bold">Frete Grátis!</span>
                    </p>
                </div>
            ) : (
                <div className="bg-green-50 p-4 border border-green-200 flex items-center gap-3">
                    <Truck size={18} className="text-green-600" />
                    <p className="text-xs text-green-700 font-bold uppercase tracking-widest">
                        Parabéns! Você ganhou Frete Grátis!
                    </p>
                </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-stone-50 p-6 border border-stone-100">
              <h2 className="font-serif text-xl text-brand-dark mb-6 flex items-center gap-2">
                <Truck size={20} className="text-brand-gold" /> Calcular Frete
              </h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="00000-000" 
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, '').substring(0, 8))}
                  className="w-full p-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-brand-gold"
                />

                {isCalculating && <p className="text-[10px] uppercase tracking-widest text-stone-400 animate-pulse">Calculando...</p>}

                {address && (
                  <div className="p-3 bg-white border border-stone-100 rounded-sm animate-fade-in text-xs space-y-2">
                    <p className="text-brand-gold font-bold uppercase tracking-widest text-[9px]">Entregar em:</p>
                    <p className="text-stone-600">{address.logradouro}, {address.bairro}</p>
                    <p className="text-stone-600">{address.localidade} - {address.uf}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <input type="text" placeholder="Nº" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} className="p-2 border border-stone-200" />
                        <input type="text" placeholder="Compl." value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} className="p-2 border border-stone-200" />
                    </div>
                  </div>
                )}

                {shippingOption && (
                    <div className="p-4 bg-brand-dark text-white rounded-sm flex justify-between items-center shadow-md">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold">{shippingOption.service}</p>
                            <p className="text-[9px] text-stone-400">{shippingOption.days} dias úteis</p>
                        </div>
                        <span className="text-lg font-serif">
                            {shippingOption.isFree ? 'GRÁTIS' : `R$ ${shippingOption.price.toFixed(2)}`}
                        </span>
                    </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 border border-stone-100 shadow-xl">
              <h2 className="font-serif text-xl mb-6 text-brand-dark">Resumo</h2>
              <div className="space-y-3 text-sm font-light text-stone-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className={shippingOption?.isFree ? 'text-green-600 font-bold' : ''}>
                    {shippingOption ? (shippingOption.isFree ? 'Grátis' : `R$ ${shippingOption.price.toFixed(2)}`) : 'A calcular'}
                  </span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between text-brand-dark font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {(cartTotal + (shippingOption?.price || 0)).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleFinalize}
                disabled={isProcessing || !shippingOption || !addressNumber}
                className="w-full mt-8 bg-brand-gold text-white py-4 uppercase text-xs tracking-widest font-bold hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? 'Processando...' : <><MessageCircle size={16} /> Finalizar WhatsApp</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
