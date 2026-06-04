import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHorse, faUtensils, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import '../css/FormSelection.css'

export default function FormSelection() {
  const navigate = useNavigate()

  const cards = [
    {
      id: 'livestock',
      title: 'Livestock Form',
      desc: 'Add new animals (Bakra, Patth, Bakri) to the inventory.',
      icon: faHorse,
      color: '#d4af37',
      path: '/admin/add-animal/livestock',
      btnText: 'Open Animal Form'
    },
    {
      id: 'meat',
      title: 'Meat Item Form',
      desc: 'Add new meat products (Mutton, Beef, Chicken, Fish) to the menu.',
      icon: faUtensils,
      color: '#800000',
      path: '/admin/add-animal/meat',
      btnText: 'Open Meat Form'
    }
  ]

  return (
    <div className="fs-container">
      <div className="fs-header">
        <h1 className="fs-title">Select Form Type</h1>
        <p className="fs-subtitle">Choose which type of product you want to add to the system</p>
      </div>

      <div className="fs-grid">
        {cards.map(card => (
          <div 
            key={card.id} 
            className="fs-card" 
            onClick={() => navigate(card.path)}
            style={{ '--accent-color': card.color }}
          >
            <div className="fs-card-icon-wrap">
              <FontAwesomeIcon icon={card.icon} className="fs-card-icon" />
            </div>
            <div className="fs-card-content">
              <h2 className="fs-card-title">{card.title}</h2>
              <p className="fs-card-desc">{card.desc}</p>
              <button className="fs-card-btn">
                {card.btnText}
                <FontAwesomeIcon icon={faArrowRight} className="fs-card-btn-icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
