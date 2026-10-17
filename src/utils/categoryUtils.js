/**
 * Utility functions for product and cart category rules.
 */

/**
 * Determines whether a product or cart item belongs to the Seafood category.
 * Checks backend category and subcategory systems (including case-insensitive
 * variations and space/hyphen formatting).
 *
 * @param {Object} item - The product or cart item to inspect
 * @returns {boolean}
 */
export const isSeafoodItem = (item) => {
  if (!item) return false
  const cat = String(item.category || '').trim().toLowerCase()
  const subcat = String(item.subcategory || item.subCategory || '').trim().toLowerCase()
  const type = String(item.itemType || item.type || '').trim().toLowerCase()

  return (
    cat === 'seafood' ||
    cat === 'sea food' ||
    cat === 'sea-food' ||
    subcat === 'seafood' ||
    subcat === 'sea food' ||
    subcat === 'sea-food' ||
    type === 'seafood'
  )
}

/**
 * Calculates 1/3 (33.33%) advance payment required for a given amount.
 *
 * @param {number} amount - Total item or category amount
 * @returns {number} Rounded 1/3 advance amount
 */
export const calculateSeafoodAdvance = (amount) => {
  if (!amount || amount <= 0) return 0
  return Math.round(amount / 3)
}
