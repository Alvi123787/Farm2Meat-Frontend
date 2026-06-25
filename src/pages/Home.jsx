import React from 'react'
import HomeHeader from '../components/HomeHeader'
import TrustBar from '../components/TrustBar'
import MeatByCategory from '../components/MeatByCategory'
import Bestsellers from '../components/Bestsellers'
import HomeFeaturedCard from '../components/HomeFeaturedCard'
import HomeCategory from '../components/HomeCategory'
import ButcherSection from '../components/ButcherSection'
import AboutPreview from '../components/AboutPreview'
import HowItWorks from '../components/HowItWorks'
import ReviewsSection from '../components/ReviewsSection'
import FAQSection from '../components/FAQSection'

const Home = () => {
  return (
    <div>
      <HomeHeader />
      <div className="min-h-screen">
        <TrustBar />
        <MeatByCategory />
        <Bestsellers />
        <HomeCategory />
        <HomeFeaturedCard />
        <ButcherSection />
        <AboutPreview />
        <FAQSection />
        <ReviewsSection mode="home" limit={4} />
        <HowItWorks />
      </div>
    </div>
  )
}

export default Home
