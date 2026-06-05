import React, { useState, useEffect, useCallback } from 'react';
import { cartStorage } from '../utils/cartStorage';
import { cartService } from '../services/cartService';
import { CartContext } from './cartContextCore';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartMeta, setCartMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [selectedButcher, setSelectedButcher] = useState(null);

  // Initialize cart from storage
  useEffect(() => {
    const loadCart = () => {
      const state = cartStorage.load();
      setCart(state.items || []);
      setCartMeta(state.meta);
      setLoading(false);
    };
    loadCart();
  }, []);

  const updateCart = useCallback((newItems) => {
    const state = cartStorage.touch(newItems);
    setCart(state.items);
    setCartMeta(state.meta);
    setLastUpdated(Date.now());

    cartService.syncSession({
      items: state.items,
      expiresAt: state.meta?.expiresAt || 0
    }).catch(err => console.error('Cart sync failed:', err));
  }, []);

  const clearCart = useCallback(() => {
    cartStorage.clear();
    setCart([]);
    setLastUpdated(Date.now());
    cartService.syncSession({ items: [], expiresAt: 0 }).catch(() => {});
  }, []);

  // Internal expiry check
  useEffect(() => {
    if (!cartMeta?.expiresAt) return;

    const checkExpiry = () => {
      if (Date.now() >= Number(cartMeta.expiresAt)) {
        clearCart();
        window.dispatchEvent(new CustomEvent('cart-expired'));
      }
    };

    const t = setInterval(checkExpiry, 5000);
    return () => clearInterval(t);
  }, [cartMeta?.expiresAt, clearCart]);

  const addItem = (product) => {
    const isMeat = product.itemType === 'meat' || product.purchaseMode === 'multi';
    
    const newItem = {
      _id: product._id,
      name: product.name || 'Unknown Item',
      breed: product.breed || '',
      weight: product.weight || '',
      age: product.age || '',
      price: product.price || '0',
      images: product.images || [],
      imageUrl: product.imageUrl || '',
      stock: product.status || 'available',
      tagId: product.animalid || product.meatid || '',
      category: product.category || '',
      farmLocation: product.farmLocation || '',
      city: product.city || '',
      itemType: product.itemType || (isMeat ? 'meat' : 'livestock'),
      purchaseMode: product.purchaseMode || (isMeat ? 'multi' : 'single'),
      quantity: 1
    };

    const existingIndex = cart.findIndex((item) => item._id === newItem._id);
    let newCart = [...cart];

    if (existingIndex >= 0) {
      // If already in cart
      if (isMeat) {
        // Increment quantity for meat items
        const existingItem = newCart[existingIndex];
        newCart[existingIndex] = { 
          ...existingItem, 
          quantity: Math.min(20, (existingItem.quantity || 1) + 1) 
        };
      } else {
        // Just ensure it's there for single purchase livestock
        newCart[existingIndex] = { ...newCart[existingIndex], ...newItem };
      }
    } else {
      newCart.push(newItem);
    }

    updateCart(newCart);
    return true;
  };

  const removeItem = (itemId) => {
    const newCart = cart.filter(item => item._id !== itemId);
    updateCart(newCart);
  };

  const updateQuantity = (itemId, delta) => {
    const newCart = cart.map(item => {
      if (item._id === itemId) {
        const isMeat = item.itemType === 'meat' || item.purchaseMode === 'multi';
        const maxQty = isMeat ? 20 : 1;
        const newQty = Math.max(1, Math.min(maxQty, (item.quantity || 1) + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCart(newCart);
  };

  const refreshCart = useCallback(() => {
    const state = cartStorage.load();
    setCart(state.items || []);
  }, []);

  const value = {
    cart,
    cartCount: cart.length,
    loading,
    lastUpdated,
    addItem,
    removeItem,
    updateQuantity,
    updateCart,
    clearCart,
    refreshCart,
    selectedButcher,
    setSelectedButcher
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
