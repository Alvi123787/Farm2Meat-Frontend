import React, { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ShopHeader from '../components/ShopHeader'
import ShopHeroSection from '../components/ShopHeroSection'
import MenuPage from '../components/MenuPage'
import CardsGrid from '../components/CardsGrid'
import '../css/Shop.css'

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawCategory = searchParams.get('category') || ''
  const rawSearch = searchParams.get('q') || ''
  const rawPrice = searchParams.get('price') || 'all'
  const rawWeight = searchParams.get('weight') || 'all'

  // Smart Navigation Filters (Livestock)
  const rawBreed = searchParams.get('breed') || ''
  const rawGender = searchParams.get('gender') || ''
  const rawCity = searchParams.get('city') || ''
  const rawStatus = searchParams.get('status') || ''
  const rawWeightRaw = searchParams.get('weight_raw') || ''

  // Determine if we should show the Menu view or the Shop view
  const showMenu = !rawCategory && !rawSearch && rawPrice === 'all' && rawWeight === 'all' && 
                   !rawBreed && !rawGender && !rawCity && !rawStatus && !rawWeightRaw

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
    if (!next) {
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
    const category = String(next?.category || '').trim()

    if (q) sp.set('q', q)
    else sp.delete('q')

    if (price !== 'all') sp.set('price', price)
    else sp.delete('price')

    if (weight !== 'all') sp.set('weight', weight)
    else sp.delete('weight')

    if (category) sp.set('category', category)

    setSearchParams(sp, { replace: false })
  }, [searchParams, setSearchParams])

  const clearFilters = useCallback(() => {
    const sp = new URLSearchParams(searchParams)
    sp.set('category', 'all')
    sp.delete('q')
    sp.delete('price')
    sp.delete('weight')
    sp.delete('breed')
    sp.delete('gender')
    sp.delete('city')
    sp.delete('status')
    sp.delete('weight_raw')
    setSearchParams(sp, { replace: false })
  }, [searchParams, setSearchParams])

  return (
    <div className="shp-page">
      {/* Header — only show on livestock shop page, not when menu is displayed */}
      {!showMenu && (
        <div className="shp-header-wrapper">
          <ShopHeader activeCategory={activeCategory} />
        </div>
      )}

      {showMenu ? (
        <div className="shp-menu-wrapper">
          <MenuPage />
        </div>
      ) : (
        <>
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
                weight: activeWeight,
                breed: rawBreed,
                gender: rawGender,
                city: rawCity,
                status: rawStatus,
                weightRaw: rawWeightRaw
              }}
              onClearFilters={clearFilters}
              showAllHref="/shop"
              showButcher={true}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Shop
