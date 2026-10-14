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

  const getItemKey = (item) => {
    if (item.category === 'fish' && item.fishDetails) {
      return `${item._id}_${item.fishDetails.selectedCut}_${item.fishDetails.sizeBracket}_${item.fishDetails.includeHead}`
    }
    return item.cartKey || item._id
  }

  const addItem = (product) => {
    const isMeat = product.type === 'meat' || product.purchaseMode === 'multi';
    const initialQty = Number(product.quantity || product.fishDetails?.pieces || 1);
    const cartKey = getItemKey(product);
    
    const newItem = {
      _id: product._id,
      cartKey,
      name: product.name || 'Unknown Item',
      breed: product.breed || '',
      weight: product.weight || '',
      age: product.age || '',
      price: product.price || '0',
      images: product.images || [],
      imageUrl: product.imageUrl || '',
      stock: isMeat ? 'available' : (product.stock || 'available'),
      availableStock: isMeat ? 99 : (typeof product.stock === 'number' ? product.stock : 1),
      category: product.category || '',
      farmLocation: product.farmLocation || '',
      city: product.city || '',
      itemType: product.type || (isMeat ? 'meat' : 'livestock'),
      purchaseMode: product.purchaseMode || (isMeat ? 'multi' : 'single'),
      quantity: initialQty,
      unit: product.unit || '',
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
      fishDetails: product.fishDetails || null
    };

    const existingIndex = cart.findIndex((item) => getItemKey(item) === cartKey);
    let newCart = [...cart];

    if (existingIndex >= 0) {
      // If already in cart
      if (isMeat) {
        // For meat items, no stock limit
        const existingItem = newCart[existingIndex];
        const maxQty = 99;
        newCart[existingIndex] = { 
          ...existingItem, 
          quantity: Math.min(maxQty, (existingItem.quantity || 1) + initialQty)
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
    const newCart = cart.filter(item => (item.cartKey || item._id) !== itemId && item._id !== itemId);
    updateCart(newCart);
  };

  const updateQuantity = useCallback((itemId, delta) => {
    const newCart = cart.map(item => {
      const matchKey = item.cartKey || item._id;
      if (matchKey === itemId || item._id === itemId) {
        const isMeat = item.itemType === 'meat' || item.purchaseMode === 'multi';
        const maxQty = isMeat ? 99 : 1;
        const newQty = Math.max(1, Math.min(maxQty, (item.quantity || 1) + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCart(newCart);
  }, [cart, updateCart]);

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
