/**
 * Formats a number or numeric string as a Pakistani Rupee currency string.
 * Default format: "Rs. 1,234"
 * 
 * @param {number|string} price - The price value to format.
 * @param {Object} options - Formatting options.
 * @param {boolean} options.withSymbol - Whether to include the "Rs. " symbol (default: true).
 * @param {boolean} options.compact - Whether to use compact notation (e.g., 1.5M, 50k) (default: false).
 * @returns {string} The formatted currency string.
 */
export const formatPrice = (price, options = {}) => {
  const { withSymbol = true, compact = false } = options;
  
  if (price === null || price === undefined || price === '') {
    return withSymbol ? 'Rs. 0' : '0';
  }

  // Parse price to number
  let num = typeof price === 'string' 
    ? parseFloat(price.replace(/[^0-9.]/g, '')) 
    : price;

  if (isNaN(num)) return String(price);

  if (compact) {
    if (num >= 1000000) return `Rs. ${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `Rs. ${(num / 1000).toFixed(0)}k`;
    return `Rs. ${num.toLocaleString('en-PK')}`;
  }

  const formatted = num.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return withSymbol ? `Rs. ${formatted}` : formatted;
};

/**
 * Parses a currency string back to a number.
 * 
 * @param {string|number} priceStr - The currency string to parse.
 * @returns {number} The parsed number.
 */
export const parsePrice = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
};
