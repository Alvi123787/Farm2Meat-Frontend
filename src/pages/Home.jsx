import React from 'react'
import HomeHeader from '../components/HomeHeader'
import TrustBar from '../components/TrustBar'
import MeatByCategory from '../components/MeatByCategory'
import BestsellerCuts from '../components/Bestsellers'
import HomeCategory from '../components/HomeCategory'
import ButcherSection from '../components/ButcherSection'
import AboutPreview from '../components/AboutPreview'
import HowItWorks from '../components/HowItWorks'
import ReviewsSection from '../components/ReviewsSection'

const Home = () => {
  return (
    <div>
      <HomeHeader />
      <div className="min-h-screen">
        <TrustBar />
        <MeatByCategory />
        <Bestsellers />
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
