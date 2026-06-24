import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './authContextCore';
import api from '../services/api';

// Create context
const FavouritesContext = createContext(null);

export const FavouritesProvider = ({ children }) => {
  const { role, token } = useAuth();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const STORAGE_KEY = 'meatbyalvi_favourites';

  // Load favourites from localStorage on initial render
  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const storedFavs = JSON.parse(stored);
          setFavourites(storedFavs);
          // Now fetch the latest data for each favourite item
          await refreshFavouriteItems(storedFavs);
        }
      } catch (err) {
        console.error('Failed to load favourites:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFavourites();
  }, []);

  // Save favourites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  }, [favourites]);

  // Refresh favourite items from backend
  const refreshFavouriteItems = async (favItems) => {
    if (favItems.length === 0) return;

    try {
      const refreshedFavs = await Promise.all(
        favItems.map(async (item) => {
          try {
            let freshItem;
            if (item.type === 'animal') {
              const response = await api.get(`/animals/${item.id}`);
              if (response.data.success && response.data.data) {
                freshItem = { ...response.data.data, type: 'animal', id: response.data.data._id };
              }
            } else if (item.type === 'meat') {
              const response = await api.get(`/meat-items/${item.id}`);
              if (response.data.success && response.data.data) {
                freshItem = { ...response.data.data, type: 'meat', id: response.data.data._id };
              }
            }
            return freshItem || item;
          } catch (err) {
            console.error(`Failed to refresh item ${item.id}:`, err);
            return item;
          }
        })
      );
      setFavourites(refreshedFavs);
    } catch (err) {
      console.error('Failed to refresh favourites:', err);
    }
  };

  // Check if an item is in favourites
  const isFavourited = (itemId, itemType) => {
    return favourites.some(
      (fav) => fav.id === itemId && fav.type === itemType
    );
  };

  // Toggle favourite (add/remove)
  const toggleFavourite = (item, itemType) => {
    setFavourites((prev) => {
      const exists = prev.some(
        (fav) => fav.id === item.id && fav.type === itemType
      );
      if (exists) {
        return prev.filter(
          (fav) => !(fav.id === item.id && fav.type === itemType)
        );
      } else {
        return [...prev, { ...item, type: itemType }];
      }
    });
  };

  // Remove favourite
  const removeFavourite = (itemId, itemType) => {
    setFavourites((prev) =>
      prev.filter((fav) => !(fav.id === itemId && fav.type === itemType))
    );
  };

  const value = {
    favourites,
    loading,
    isFavourited,
    toggleFavourite,
    removeFavourite,
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
};

// Custom hook to use the FavouritesContext
export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};
