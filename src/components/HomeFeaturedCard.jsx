import React, { useEffect, useRef, useState } from "react";
import "../css/HomeFeaturedCard.css";

const HomeFeaturedCard = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const featuredGoats = [
        {
            id: 1,
            name: "Chand 2026",
            weight: "85 KG",
            age: "2 Years",
            location: "Rahim Yar Khan",
            price: "145,000",
            oldPrice: "160,000",
            img: "../uploads/card1.jpg",
            badge: "Featured",
            badgeIcon: "🔥",
            breed: "Pure Beetal",
            color: "128, 0, 0",
        },
        {
            id: 2,
            name: "Sultan",
            weight: "92 KG",
            age: "2.5 Years",
            location: "Multan Farm",
            price: "180,000",
            oldPrice: "210,000",
            img: "../uploads/card2.jpg",
            badge: "Premium",
            badgeIcon: "⭐",
            breed: "Rajanpuri",
            color: "163, 130, 35",
        },
        {
            id: 3,
            name: "Heera",
            weight: "78 KG",
            age: "1.8 Years",
            location: "Faisalabad",
            price: "125,000",
            oldPrice: "140,000",
            img: "../uploads/card3.jpg",
            badge: "Qurbani Special",
            badgeIcon: "🕌",
            breed: "Gulabi Pather",
            color: "45, 100, 60",
        },
    ];

    return (
        <div className="container-fluid">
            <section
                className={`homeFeatured-section ${isVisible ? "homeFeatured-visible" : ""}`}
                ref={sectionRef}
            >
                {/* Section Header */}
                <div className="homeFeatured-header">
                    <span className="homeFeatured-header-badge">HAND PICKED</span>
                    <h2 className="homeFeatured-header-title">
                        Recommended <span className="homeFeatured-title-accent">Collection</span>
                    </h2>
                    <p className="homeFeatured-header-sub">
                        Hamari behtareen aur sehatmand bakron ki muntakhab collection
                    </p>
                    <div className="homeFeatured-header-line">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="homeFeatured-grid">
                    {featuredGoats.map((goat, index) => (
                        <div
                            key={goat.id}
                            className="homeFeatured-card-wrapper"
                            style={{ "--homeFeatured-card-delay": `${index * 0.15}s`, "--homeFeatured-card-color": goat.color }}
                        >
                            <div className="homeFeatured-card">
                                {/* Image Area */}
                                <div className="homeFeatured-card-visual">
                                    <img src={goat.img} alt={goat.name} className="homeFeatured-card-img" />
                                    <div className="homeFeatured-card-badge">
                                        <span>{goat.badgeIcon}</span>
                                        <span>{goat.badge}</span>
                                    </div>
                                    <div className="homeFeatured-card-actions">
                                        <button className="homeFeatured-action-btn" title="Add to Wishlist">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                            </svg>
                                        </button>
                                        <button className="homeFeatured-action-btn" title="Quick View">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="homeFeatured-card-body">
                                    <span className="homeFeatured-card-breed">{goat.breed}</span>
                                    <h3 className="homeFeatured-card-name">{goat.name}</h3>

                                    <div className="homeFeatured-card-stats">
                                        <div className="homeFeatured-stat">
                                            <span className="homeFeatured-stat-label">Weight</span>
                                            <span className="homeFeatured-stat-value">{goat.weight}</span>
                                        </div>
                                        <div className="homeFeatured-stat">
                                            <span className="homeFeatured-stat-label">Age</span>
                                            <span className="homeFeatured-stat-value">{goat.age}</span>
                                        </div>
                                        <div className="homeFeatured-stat">
                                            <span className="homeFeatured-stat-label">Location</span>
                                            <span className="homeFeatured-stat-value">{goat.location}</span>
                                        </div>
                                    </div>

                                    <div className="homeFeatured-card-price-row">
                                        <div className="homeFeatured-price-box">
                                            <span className="homeFeatured-price-label">Fixed Price</span>
                                            <div className="homeFeatured-price-main">
                                                <span className="currency">Rs.</span>
                                                <span className="amount">{goat.price}</span>
                                            </div>
                                            <span className="homeFeatured-price-old">Rs. {goat.oldPrice}</span>
                                        </div>
                                    </div>

                                    <div className="homeFeatured-card-footer">
                                        <button className="homeFeatured-view-btn">
                                            <span>View Details</span>
                                        </button>
                                        <button className="homeFeatured-cart-btn">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                                <line x1="3" y1="6" x2="21" y2="6" />
                                                <path d="M16 10a4 4 0 0 1-8 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomeFeaturedCard;