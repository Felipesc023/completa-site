
import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
// Fix: Import from firebase/firestore as a namespace to resolve "no exported member" errors.
import * as firestore from 'firebase/firestore';
import { Order } from '../../types';
import { ShoppingBag, CheckCircle, Clock, Search, MessageCircle, ExternalLink, Filter } from 'lucide-react';

const { collection, query, orderBy, onSnapshot, doc, updateDoc } = firestore;

export const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status,
        paidAt: status === 'pago' ? new Date().toISOString() : null
      });
    } catch (error) {
      alert("Erro ao atualizar pedido.");
    }
  };

  const setPaymentLink = async (orderId: string) => {
    const link = prompt("Insira o link de pagamento do PagSeguro:");
    if (link) {
      await updateDoc(doc(db, 'orders', orderId), { paymentLink: link });
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aguardando_pagamento': return <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] uppercase font-bold border border-yellow-100 rounded">Aguardando Pagamento</span>;
      case 'pago': return <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] uppercase font-bold border border-green-100 rounded">Pago</span>;
      default: return <span className="px-2 py-1 bg-stone-50 text-stone-500 text-[10px] uppercase font-bold border border-stone-100 rounded">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif text-brand-dark">Pedidos</h1>
        <p className="text-stone-500 text-sm font-light mt-1">Gerencie as vendas e pagamentos via WhatsApp.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-3.5 text-stone-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por cliente ou ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all placeholder-stone-400"
                />
            </div>
            <Filter size={20} className="text-stone-300" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-6 py-4">ID / Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-brand-dark">#{order.id.substring(0,8)}</div>
                    <div className="text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-stone-700">{order.customerName}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-widest">{order.address.city}/{order.address.state}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-brand-dark">
                    R$ {order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => setPaymentLink(order.id)}
                            className="p-2 text-stone-400 hover:text-brand-gold transition-colors"
                            title="Definir Link PagSeguro"
                        >
                            <ExternalLink size={16} />
                        </button>
                        
                        {order.status !== 'pago' ? (
                            <button 
                                onClick={() => updateOrderStatus(order.id, 'pago')}
                                className="p-2 text-stone-400 hover:text-green-600 transition-colors"
                                title="Marcar como Pago"
                            >
                                <CheckCircle size={16} />
                            </button>
                        ) : (
                            <a 
                                href={`https://wa.me/${order.customerPhone}?text=Olá! Confirmamos o pagamento do seu pedido #${order.id.substring(0,8)}. Ele já está em separação!`}
                                target="_blank"
                                className="p-2 text-green-500 hover:bg-green-50 rounded"
                            >
                                <MessageCircle size={16} />
                            </a>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
