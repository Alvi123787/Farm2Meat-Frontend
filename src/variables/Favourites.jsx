import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useFavourites } from "../contexts/FavouritesContext";
import { buildMediaUrl, isAbsoluteUrl } from "../utils/mediaUrl";
import { formatPrice } from "../utils/priceUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faTrashCan,
  faSlidersH,
  faPaw,
  faDrumstickBite,
  faBoxOpen,
  faStar,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import "../css/Favourites.css";

export default function Favourites() {
  const { favourites, removeFavourite, loading } = useFavourites();
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const categories = useMemo(() => {
    const cats = ["All"];
    favourites.forEach((item) => {
      const cat = item.type === "animal" ? "Animals" : "Meat";
      if (!cats.includes(cat)) cats.push(cat);
    });
    return cats;
  }, [favourites]);

  const visible = useMemo(() => {
    if (filter === "All") return favourites;
    return favourites.filter(
      (item) =>
        (filter === "Animals" && item.type === "animal") ||
        (filter === "Meat" && item.type === "meat")
    );
  }, [favourites, filter]);

  const getImageUrl = (item) => {
    const img = item.images?.[0] || item.imageUrl || item.img;
    if (!img) return "/placeholder.jpg";
    if (isAbsoluteUrl(img)) return img;
    return buildMediaUrl(img) || "/placeholder.jpg";
  };

  const categoryIcon = (type) =>
    type === "animal" ? faPaw : faDrumstickBite;

  if (loading) {
    return (
      <div className="fav-page">
        <div className="fav-hero">
          <div className="fav-hero-background">
            <div className="fav-hero-gradient"></div>
            <div className="fav-hero-pattern"></div>
          </div>
          <div className="fav-hero-content">
            <h1 className="fav-hero-title">Your Favourites</h1>
            <p className="fav-hero-description">Loading your favourites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fav-page">
      {/* ── Hero Header ── */}
      <div className="fav-hero">
        <div className="fav-hero-background">
          <div className="fav-hero-gradient"></div>
          <div className="fav-hero-pattern"></div>
        </div>
        
        <div className="fav-hero-content">
          <div className="fav-hero-left">
            <div className="fav-hero-badge">
              <FontAwesomeIcon icon={faStar} className="fav-hero-badge-icon" />
              <span>Curated Collection</span>
            </div>
            <h1 className="fav-hero-title">
              Your Favourites
            </h1>
            <p className="fav-hero-description">
              {favourites.length === 0
                ? "Begin your collection by saving items you love"
                : `${favourites.length} premium ${favourites.length === 1 ? 'item' : 'items'} carefully selected by you`}
            </p>
          </div>

          <div className="fav-hero-stats">
            <div className="fav-stat-card">
              <div className="fav-stat-icon">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <div className="fav-stat-content">
                <span className="fav-stat-number">{favourites.length}</span>
                <span className="fav-stat-label">Saved Items</span>
              </div>
            </div>
            
            <div className="fav-stat-card">
              <div className="fav-stat-icon fav-stat-icon--secondary">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
              <div className="fav-stat-content">
                <span className="fav-stat-number">{categories.length - 1}</span>
                <span className="fav-stat-label">Categories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls Bar ── */}
      {favourites.length > 0 && (
        <div className="fav-controls">
          <div className="fav-controls-left">
            <div className="fav-filter-group">
              <FontAwesomeIcon icon={faSlidersH} className="fav-controls-icon" />
              <span className="fav-controls-label">Filter:</span>
              <div className="fav-filter-chips">
                {categories.map((c) => {
                  const count = c === "All"
                    ? favourites.length
                    : favourites.filter((i) =>
                        c === "Animals" ? i.type === "animal" : i.type === "meat"
                      ).length;
                  
                  return (
                    <button
                      key={c}
                      className={`fav-chip ${filter === c ? "fav-chip--active" : ""}`}
                      onClick={() => setFilter(c)}
                    >
                      <span className="fav-chip-text">{c}</span>
                      <span className="fav-chip-badge">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="fav-controls-right">
            <div className="fav-view-toggle">
              <button
                className={`fav-view-btn ${viewMode === "grid" ? "fav-view-btn--active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="9.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="1" y="9.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
              <button
                className={`fav-view-btn ${viewMode === "list" ? "fav-view-btn--active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="2" width="14" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="1" y="6.75" width="14" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="1" y="11.5" width="14" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {visible.length === 0 ? (
        <div className="fav-empty-state">
          <div className="fav-empty-icon-container">
            <FontAwesomeIcon icon={faBoxOpen} className="fav-empty-icon" />
            <div className="fav-empty-icon-glow"></div>
          </div>
          <h2 className="fav-empty-title">
            {filter !== "All" ? `No ${filter} Found` : "No Favourites Yet"}
          </h2>
          <p className="fav-empty-text">
            {filter !== "All"
              ? `You haven't saved any ${filter.toLowerCase()} yet. Browse our collection to discover more.`
              : "Start building your collection by adding items you love from our shop."}
          </p>
          {filter !== "All" && (
            <button 
              className="fav-empty-action"
              onClick={() => setFilter("All")}
            >
              View All Favourites
            </button>
          )}
        </div>
      ) : (
        <div className={`fav-collection ${viewMode === "list" ? "fav-collection--list" : ""}`}>
          {visible.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={item.type === "meat" ? "/menu-page" : `/shop/${item.id}`}
              className="fav-item"
            >
              <div className="fav-item-image-wrapper">
                <img
                  src={getImageUrl(item)}
                  alt={item.name}
                  className="fav-item-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                />
                <div className="fav-item-overlay">
                  <button
                    className="fav-item-remove"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavourite(item.id, item.type);
                    }}
                    title="Remove from favourites"
                    aria-label={`Remove ${item.name}`}
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                    <span>Remove</span>
                  </button>
                </div>
                
                <div className="fav-item-type-badge">
                  <FontAwesomeIcon icon={categoryIcon(item.type)} />
                  <span>{item.type === "animal" ? "Animal" : "Meat"}</span>
                </div>
              </div>

              <div className="fav-item-content">
                <div className="fav-item-header">
                  <h3 className="fav-item-name">{item.name}</h3>
                  {item.breed && (
                    <p className="fav-item-breed">{item.breed}</p>
                  )}
                </div>

                <div className="fav-item-footer">
                  <div className="fav-item-price-group">
                    <span className="fav-item-price">{formatPrice(item.price)}</span>
                    {item.weight && (
                      <span className="fav-item-weight">{item.weight}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}