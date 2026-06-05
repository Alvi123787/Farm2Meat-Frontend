import { useNavigate } from 'react-router-dom';

/**
 * useSmartNavigation Hook
 * Implements a conditional navigation system based on item_type_id.
 * 
 * Principle:
 * - item_type_id === 1 (Livestock) -> Redirect to /shop with livestock filters
 * - item_type_id === 2 (Meat)      -> Redirect to /menu-page with meat filters
 * - If redirection is not configured for the item, or item_type_id is unknown,
 *   it falls back to normal behavior.
 */
export const useSmartNavigation = () => {
  const navigate = useNavigate();

  const smartNavigate = (item) => {
    // 1. Strict Principle: If no item_type_id or missing redirection config, do nothing.
    // Redirection must be explicitly enabled via 'enableRedirection' property on the item.
    if (!item || !item.item_type_id || !item.enableRedirection) {
      return false; // Signals to the caller that smart navigation did not run
    }

    const { item_type_id } = item;
    const params = new URLSearchParams();

    // 2. Livestock Path (item_type_id === 1)
    if (item_type_id === 1) {
      // Collect relevant livestock properties
      if (item.category) params.set('category', item.category);
      if (item.breed)    params.set('breed', item.breed);
      if (item.gender)   params.set('gender', item.gender);
      if (item.weight)   params.set('weight_raw', item.weight); // Use raw weight if available
      if (item.city)     params.set('city', item.city);
      if (item.status)   params.set('status', item.status);

      navigate(`/shop?${params.toString()}`);
      return true;
    }

    // 3. Meat Path (item_type_id === 2)
    if (item_type_id === 2) {
      // Collect relevant meat properties
      if (item.category)     params.set('category', item.category.toLowerCase());
      if (item.unit)         params.set('unit', item.unit);
      if (item.isBestseller) params.set('bestseller', 'true');
      if (item.isAvailable)  params.set('available', 'true');

      navigate(`/menu-page?${params.toString()}`);
      return true;
    }

    // fallback for unknown item_type_id
    return false;
  };

  return { smartNavigate };
};
