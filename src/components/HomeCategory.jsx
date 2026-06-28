import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../css/HomeCategory.css';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

const normalize = (v) => String(v || '').trim().toLowerCase()

const HomeCategory = () => {
  const navigate = useNavigate();
  const { smartNavigate } = useSmartNavigation();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [counts, setCounts] = useState({})
  const [countsLoading, setCountsLoading] = useState(true)

  const categories = useMemo(() => ([
    {
      title: "Bakra",
      subtitle: "Qurbani ke liye behtareen aur sehatmand nar bakray.",
      img: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1775622451/lisaredfern-goat-707467_1280_e4cp0o.jpg",
      gradientColor: "139, 69, 19",
      accentColor: "#D2691E",
      tag: "Most Popular",
      type: "livestock",
      category: "Bakra",
      enableRedirection: true,
    },
    {
      title: "Patth",
      subtitle: "Palne ke liye munasib umar aur achi nasl ki patth.",
      img: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1775622580/jaclou-dl-goat-2775034_1280_okmk38.jpg",
      gradientColor: "34, 85, 34",
      accentColor: "#2E8B57",
      tag: "Best Value",
      type: "livestock",
      category: "Patth",
      enableRedirection: true,
    },
    {
      title: "Bakri",
      subtitle: "Doodh aur nasl barhane ke liye top quality bakriyan.",
      img: "https://res.cloudinary.com/dqclqmuhi/image/upload/v1775622609/bones64-goat-2484986_1280_heycvx.jpg",
      gradientColor: "128, 0, 0",
      accentColor: "#A0522D",
      tag: "Top Quality",
      type: "livestock",
      category: "Bakri",
      enableRedirection: true,
    }
  ]), []);

  useEffect(() => {
    const controller = new AbortController()
    const loadCounts = async () => {
      setCountsLoading(true)
      try {
        const response = await api.get('/api/animals', { signal: controller.signal })
        const result = response.data
        const animals = Array.isArray(result?.data) ? result.data : []

        const visible = animals.filter((a) => a?.visibility !== false)
        const available = visible.filter((a) => {
          const s = normalize(a?.status)
          return s === 'available' || s === 'new'
        })

        const next = {}
        available.forEach((a) => {
          const c = String(a?.category || '').trim()
          if (!c) return
          next[c] = (next[c] || 0) + 1
        })
        setCounts(next)
      } catch (e) {
        void e
        setCounts({})
      } finally {
        setCountsLoading(false)
      }
    }

    loadCounts()
    return () => controller.abort()
  }, [])

  return (
    <section className="hc-wrapper">
      <div className="hc-bg-decor">
        <div className="hc-decor-circle hc-decor-circle-1"></div>
        <div className="hc-decor-circle hc-decor-circle-2"></div>
      </div>

      <div className="container-fluid px-lg-5">
        <div className="row mb-5">
          <div className="col-12">
            <span className="hc-badge">CATEGORIES</span>
            <h2 className="hc-title">
              Shop <span className="hc-title-highlight">Livestocks</span>
            </h2>
            <p className="hc-subtitle">
              Select the most relevant category for your needs
            </p>
            <div className="hc-title-divider">
              <span className="hc-divider-dot"></span>
              <span className="hc-divider-line"></span>
              <span className="hc-divider-dot"></span>
            </div>
          </div>
        </div>

        <div className="row g-5 px-md-3">
          {categories.map((cat, index) => (
            <div key={index} className="col-12 col-md-4">
              <div
                className={`hc-card ${hoveredIndex === index ? 'hc-card-hovered' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  '--hc-gradient-color': cat.gradientColor,
                  '--hc-accent-color': cat.accentColor
                }}
              >
                <div className="hc-card-img-wrapper">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="hc-card-img"
                  />
                </div>

                <div className="hc-card-gradient"></div>
                <div className="hc-card-shimmer"></div>

                <div className="hc-card-tag">
                  <span>{cat.tag}</span>
                </div>

                <div className="hc-card-content">
                  <div className="hc-card-count">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>
                      {countsLoading ? '— Available' : `${counts[cat.title] || 0} Available`}
                    </span>
                  </div>

                  <h3 className="hc-card-title">{cat.title}</h3>
                  <p className="hc-card-subtitle">{cat.subtitle}</p>

                  <button
                    className="hc-card-btn"
                    type="button"
                    onClick={() => {
                      if (!smartNavigate(cat)) {
                        navigate(`/shop?category=${encodeURIComponent(cat.title)}`);
                      }
                    }}
                  >
                    <span>Explore Now</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>

                <div className="hc-card-accent-line"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategory;