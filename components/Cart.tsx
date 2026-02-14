
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
// Fix: Import from firebase/firestore as a namespace to resolve "no exported member" errors.
import * as firestore from 'firebase/firestore';
import { ShoppingBag, Trash2, Truck, MapPin, ArrowRight, MessageCircle } from 'lucide-react';
import { getAddressByCep, calculateShipping, ShippingOption } from '../services/shippingService';
import { useNavigate } from 'react-router-dom';

const { collection, addDoc } = firestore;

export const Cart: React.FC = () => {
  const { items, removeFromCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<any>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form de endereço adicional
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');

  useEffect(() => {
    if (cep.length === 8) {
      handleCepLookup();
    }
  }, [cep, items]); // Recalcular se o carrinho mudar

  const handleCepLookup = async () => {
    setIsCalculating(true);
    const addr = await getAddressByCep(cep);
    if (addr) {
      setAddress(addr);
      const options = calculateShipping(cep, items);
      setShippingOptions(options);
      if (options.length > 0) setSelectedShipping(options[0]);
    } else {
      setAddress(null);
      setShippingOptions([]);
      setSelectedShipping(null);
    }
    setIsCalculating(false);
  };

  const handleFinalize = async () => {
    if (!selectedShipping || !address || !addressNumber) {
      alert("Por favor, preencha o CEP e o número do endereço.");
      return;
    }

    setIsProcessing(true);
    try {
      const subtotal = cartTotal;
      const total = subtotal + selectedShipping.price;

      const orderData = {
        userId: user?.id || null,
        customerName: user?.name || 'Cliente Site',
        customerPhone: '', // Pegará no WhatsApp
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
          price: i.salePrice || i.price,
          size: i.selectedSize
        })),
        shipping: {
          service: selectedShipping.service,
          price: selectedShipping.price,
          days: selectedShipping.days
        },
        subtotal,
        total,
        status: 'aguardando_pagamento',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      // Gerar Mensagem de WhatsApp
      const resumoItens = items.map(i => `- ${i.name} (${i.selectedSize}) x${i.quantity}: R$ ${(i.salePrice || i.price).toFixed(2)}`).join('%0A');
      const mensagem = `Olá Completa! Acabei de fazer um pedido no site.%0A%0A*Resumo do Pedido:*%0A${resumoItens}%0A%0A*Logística:*%0A- Frete: ${selectedShipping.service} (${selectedShipping.days} dias)%0A- Endereço: ${address.logradouro}, ${addressNumber} - ${address.localidade}/${address.uf}%0A%0A*Total: R$ ${total.toFixed(2)}*%0A%0APor favor, me envie o link do PagSeguro para pagamento.`;
      
      const whatsappUrl = `https://wa.me/5516988289153?text=${mensagem}`;
      window.open(whatsappUrl, '_blank');
      
      alert("Pedido registrado! Você será redirecionada para o WhatsApp para receber o link de pagamento.");
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
        <p className="text-stone-500 font-light mb-8">Escolha suas peças favoritas e elas aparecerão aqui.</p>
        <button onClick={() => navigate('/shop')} className="bg-brand-dark text-white px-8 py-3 uppercase text-xs tracking-widest hover:bg-brand-gold transition-all">Explorar Loja</button>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-20 bg-white min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl text-brand-dark mb-12 text-center">Sacola de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Itens */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 p-4 border border-stone-100 rounded-sm group">
                <div className="w-24 h-32 bg-stone-50 rounded-sm overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-brand-dark">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Tam: {item.selectedSize}</p>
                  <p className="text-xs text-stone-600 mt-4">Qtd: {item.quantity}</p>
                  <p className="text-sm font-medium text-brand-dark mt-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.salePrice || item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Info */}
          <div className="space-y-6">
            <div className="bg-stone-50 p-6 rounded-sm border border-stone-100">
              <h2 className="font-serif text-xl text-brand-dark mb-6 flex items-center gap-2">
                <Truck size={20} className="text-brand-gold" /> Cálculo de Entrega
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-stone-500 block mb-2">CEP de Destino</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="00000-000" 
                      value={cep}
                      onChange={(e) => setCep(e.target.value.replace(/\D/g, '').substring(0, 8))}
                      className="flex-grow p-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                {isCalculating && <p className="text-xs text-stone-400 animate-pulse">Consultando frete...</p>}

                {address && (
                  <div className="p-3 bg-white border border-stone-100 rounded-sm animate-fade-in">
                    <p className="text-[10px] text-brand-gold uppercase tracking-widest mb-1">Entregar em:</p>
                    <p className="text-xs text-stone-600">{address.logradouro}, {address.bairro}</p>
                    <p className="text-xs text-stone-600">{address.localidade} - {address.uf}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Número" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} className="w-full p-2 border border-stone-200 text-xs" />
                        <input type="text" placeholder="Compl." value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} className="w-full p-2 border border-stone-200 text-xs" />
                    </div>
                  </div>
                )}

                {shippingOptions.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {shippingOptions.map(opt => (
                      <label key={opt.service} className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${selectedShipping?.service === opt.service ? 'border-brand-gold bg-brand-beige/20' : 'border-stone-200 bg-white'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={selectedShipping?.service === opt.service} onChange={() => setSelectedShipping(opt)} className="text-brand-gold focus:ring-brand-gold" />
                          <div>
                            <p className="text-xs font-bold text-brand-dark uppercase tracking-widest">{opt.service} Correios</p>
                            <p className="text-[10px] text-stone-400 uppercase">{opt.days} dias úteis</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">R$ {opt.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-brand-dark text-white p-6 rounded-sm shadow-xl">
              <h2 className="font-serif text-xl mb-6">Resumo</h2>
              <div className="space-y-3 text-sm font-light text-stone-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{selectedShipping ? `R$ ${selectedShipping.price.toFixed(2)}` : 'A calcular'}</span>
                </div>
                <div className="border-t border-stone-700 pt-3 flex justify-between text-white font-medium">
                  <span>Total</span>
                  <span className="text-xl">R$ {(cartTotal + (selectedShipping?.price || 0)).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleFinalize}
                disabled={isProcessing || !selectedShipping || (address && !addressNumber)}
                className="w-full mt-8 bg-brand-gold text-white py-4 uppercase text-xs tracking-[0.2em] font-bold hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? 'Processando...' : (
                  <>
                    <MessageCircle size={16} /> Finalizar pelo WhatsApp
                  </>
                )}
              </button>
              <p className="text-[9px] uppercase tracking-widest text-stone-400 mt-4 text-center leading-relaxed">
                Ao clicar em finalizar, seu pedido será salvo e abriremos o WhatsApp para você receber o link de pagamento PagSeguro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
