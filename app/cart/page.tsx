'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState, useEffect, ChangeEvent } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface StockInfo {
    stock: number;
    isUnlimited: boolean;
}

const CartPage = () => {
  const { cartItems, removeFromCart, updateItemQuantity, clearCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  
  const [stockInfo, setStockInfo] = useState<Record<string, StockInfo>>({});
  const [isStockLoading, setIsStockLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);

    const fetchStockInfo = async () => {
      if (cartItems.length === 0) {
        setIsStockLoading(false);
        return;
      }

      const newStockInfo: Record<string, StockInfo> = {};
      try {
        for (const item of cartItems) {
          const productRef = doc(db, "products", item.id);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const data = productSnap.data();
            newStockInfo[item.id] = { 
                stock: data.stock || 0,
                isUnlimited: data.isUnlimited || false,
            };
          }
        }
        setStockInfo(newStockInfo);
      } catch (error) {
        console.error("Eroare la preluarea stocului:", error);
      } finally {
        setIsStockLoading(false);
      }
    };
    
    fetchStockInfo();
  }, [cartItems]);
  
  const handleQuantityChange = (itemId: string, e: ChangeEvent<HTMLInputElement>) => {
      let value = parseInt(e.target.value, 10);
      const productStockInfo = stockInfo[itemId] ?? { stock: 0, isUnlimited: false };

      if (isNaN(value) || value < 1) {
          value = 1;
      }
      
      if (!productStockInfo.isUnlimited && value > productStockInfo.stock) {
          value = productStockInfo.stock;
      }

      updateItemQuantity(itemId, value);
  };


  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Coșul tău de cumpărături</h1>

        {!isClient || isStockLoading ? (
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">Se încarcă coșul...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">Coșul tău este gol.</p>
            <Link href="/" className="mt-4 inline-block px-6 py-3 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
              Continuă cumpărăturile
            </Link>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200">
              {cartItems.map(item => {
                const productStockInfo = stockInfo[item.id] ?? { stock: 0, isUnlimited: false };
                
                return (
                  <li key={item.id} className="flex py-6 items-center">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100"></div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">{(item.price * item.quantity).toFixed(2)} RON</p>
                        </div>
                        {!productStockInfo.isUnlimited && item.quantity > productStockInfo.stock && productStockInfo.stock > 0 && (
                            <p className="text-sm text-red-600 mt-1">
                                Cantitate maximă atinsă ({productStockInfo.stock} disponibile).
                            </p>
                        )}
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm mt-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md" disabled={item.quantity <= 1}>
                            <Minus size={16} />
                          </button>
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e)}
                            className="w-12 text-center border-y-0 border-x text-gray-900 font-semibold focus:outline-none focus:ring-0"
                           />
                          <button 
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)} 
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md" 
                            disabled={!productStockInfo.isUnlimited && item.quantity >= productStockInfo.stock}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="flex">
                          <button onClick={() => removeFromCart(item.id)} type="button" className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1">
                            <Trash2 size={16} />
                            <span>Șterge</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between text-lg font-medium text-gray-900">
                <p>Subtotal</p>
                <p>{subtotal.toFixed(2)} RON</p>
              </div>
              <p className="mt-1 text-sm text-gray-500">Taxele de livrare vor fi calculate la checkout.</p>
              <div className="mt-6">
                <Link href="/checkout" className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700">
                  Finalizează comanda
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;