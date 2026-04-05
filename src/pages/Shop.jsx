import React, { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ShopHeader from '../components/ShopHeader'
import ShopHeroSection from '../components/ShopHeroSection'
import CardsGrid from '../components/CardsGrid'
import '../css/Shop.css'

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawCategory = searchParams.get('category') || ''
  const rawSearch = searchParams.get('q') || ''
  const rawPrice = searchParams.get('price') || 'all'
  const rawWeight = searchParams.get('weight') || 'all'

  const activeCategory = useMemo(() => {
    const c = rawCategory.trim()
    return c ? c : 'all'
  }, [rawCategory])

  const activeSearch = useMemo(() => rawSearch.trim(), [rawSearch])
  const activePrice = useMemo(() => (rawPrice || 'all').trim() || 'all', [rawPrice])
  const activeWeight = useMemo(() => (rawWeight || 'all').trim() || 'all', [rawWeight])

  const setCategory = useCallback((category) => {
    const next = String(category || '').trim()
    const sp = new URLSearchParams(searchParams)
    if (!next || next === 'all') {
      sp.delete('category')
    } else {
      sp.set('category', next)
    }
    setSearchParams(sp, { replace: false })
  }, [searchParams, setSearchParams])

  const setFilters = useCallback((next) => {
    const sp = new URLSearchParams(searchParams)
    const q = String(next?.search || '').trim()
    const price = String(next?.price || 'all').trim() || 'all'
    const weight = String(next?.weight || 'all').trim() || 'all'

    if (q) sp.set('q', q)
    else sp.delete('q')

    if (price !== 'all') sp.set('price', price)
    else sp.delete('price')

    if (weight !== 'all') sp.set('weight', weight)
    else sp.delete('weight')

    setSearchParams(sp, { replace: false })
  }, [searchParams, setSearchParams])

  const clearFilters = useCallback(() => {
    const sp = new URLSearchParams(searchParams)
    sp.delete('category')
    sp.delete('q')
    sp.delete('price')
    sp.delete('weight')
    setSearchParams(sp, { replace: false })
  }, [searchParams, setSearchParams])

  return (
    <div className="shp-page">
      {/* Header — highest z-index */}
      <div className="shp-header-wrapper">
        <ShopHeader activeCategory={activeCategory} />
      </div>

      {/* Filters — must sit ABOVE the grid */}
      <div className="shp-filters-wrapper">
        <ShopHeroSection
          activeCategory={activeCategory}
          onCategoryChange={setCategory}
          showHero={false}
          searchValue={activeSearch}
          priceValue={activePrice}
          weightValue={activeWeight}
          onFilter={setFilters}
        />
      </div>

      {/* Cards Grid — lowest layer */}
      <div className="shp-grid-wrapper">
        <CardsGrid
          filters={{
            category: activeCategory,
            search: activeSearch,
            price: activePrice,
            weight: activeWeight
          }}
          onClearFilters={clearFilters}
          showAllHref="/shop"
          showButcher={true}
        />
      </div>
    </div>
  )
}

export default Shop
