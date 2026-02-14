
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import * as firestore from 'firebase/firestore';
import { ShoppingBag, Trash2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { collection, addDoc } = firestore;

export const Cart: React.FC = () => {
  const { items, removeFromCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinalize = async () => {
    setIsProcessing(true);
    try {
      const orderData = {
        userId: user?.id || null,
        customerName: user?.name || 'Cliente Site',
        customerPhone: '',
        customerEmail: user?.email || '',
        address: {
          cep: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: ''
        },
        items: items.map(i => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.promoPrice || i.price,
          size: i.selectedSize
        })),
        subtotal: cartTotal,
        total: cartTotal,
        status: 'aguardando_pagamento' as const,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      const resumoItens = items.map(i => `- ${i.name} (${i.selectedSize}) x${i.quantity}: R$ ${(i.promoPrice || i.price).toFixed(2)}`).join('%0A');
      const mensagem = `Olá Completa! Acabei de fazer um pedido no site.%0A%0A*Resumo do Pedido:*%0A${resumoItens}%0A%0A*Total: R$ ${cartTotal.toFixed(2)}*%0A%0APor favor, me envie o link para pagamento.`;
      
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
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 border border-stone-100 shadow-xl">
              <h2 className="font-serif text-xl mb-6 text-brand-dark">Resumo</h2>
              <div className="space-y-3 text-sm font-light text-stone-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between text-brand-dark font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleFinalize}
                disabled={isProcessing}
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
