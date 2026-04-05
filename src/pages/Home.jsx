import React from 'react'
import HomeHeader from '../components/HomeHeader'
import TrustBar from '../components/TrustBar'
import HomeCategory from '../components/HomeCategory'
import ButcherSection from '../components/ButcherSection'
import AboutPreview from '../components/AboutPreview'
import HowItWorks from '../components/HowItWorks'
import ReviewsSection from '../components/ReviewsSection'

const Home = () => {
  return (
    <div>
      <div className="free-delivery-banner" style={{ background: '#800000', color: '#fff', textAlign: 'center', padding: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>
        🚚 Free Home Delivery Available on All Orders!
      </div>
      <HomeHeader />
      <div className="min-h-screen">
        <TrustBar />
        <HomeCategory />
        <ButcherSection />
        <AboutPreview />
        <ReviewsSection mode="home" limit={4} />
        <HowItWorks />
      </div>
    </div>
  )
}

export default Home
