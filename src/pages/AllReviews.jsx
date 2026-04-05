import React from 'react'
import ReviewsSection from '../components/ReviewsSection'

export default function AllReviews() {
  return (
    <div>
      <ReviewsSection mode="all" limit={null} hideWhenEmpty={false} />
    </div>
  )
}

