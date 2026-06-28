import React, { useState, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import '../css/Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faStore,
  faCartShopping,
  faComments,
  faUserShield,
  faGauge,
  faDrumstickBite,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContextCore';
import { useCart } from '../contexts/cartContextCore';

const W = 460;
const H = 84;
const TOP_Y = 28;
const BAR_H = H - TOP_Y;
const R = BAR_H / 2;
const PAD_X = 42;
const NOTCH_W = 33;
const NOTCH_S = 15;

function generatePillPath(activeIndex, totalItems) {
  if (activeIndex === -1) {
    return [
      `M ${R},${TOP_Y}`,
      `H ${W - R}`,
      `A ${R} ${R} 0 0 1 ${W} ${TOP_Y + R}`,
      `V ${H - R}`,
      `A ${R} ${R} 0 0 1 ${W - R} ${H}`,
      `H ${R}`,
      `A ${R} ${R} 0 0 1 0 ${H - R}`,
      `V ${TOP_Y + R}`,
      `A ${R} ${R} 0 0 1 ${R} ${TOP_Y}`,
      'Z',
    ].join(' ');
  }

  const usable = W - PAD_X * 2;
  const itemW = usable / totalItems;
  let cx = PAD_X + itemW * activeIndex + itemW / 2;

  const minCx = R + NOTCH_W + NOTCH_S + 4;
  const maxCx = W - R - NOTCH_W - NOTCH_S - 4;
  cx = Math.max(minCx, Math.min(maxCx, cx));

  return [
    `M ${R},${TOP_Y}`,
    `H ${cx - NOTCH_W - NOTCH_S}`,
    `C ${cx - NOTCH_W},${TOP_Y} ${cx - NOTCH_W},0 ${cx},0`,
    `C ${cx + NOTCH_W},0 ${cx + NOTCH_W},${TOP_Y} ${cx + NOTCH_W + NOTCH_S},${TOP_Y}`,
    `H ${W - R}`,
    `A ${R} ${R} 0 0 1 ${W} ${TOP_Y + R}`,
    `V ${H - R}`,
    `A ${R} ${R} 0 0 1 ${W - R} ${H}`,
    `H ${R}`,
    `A ${R} ${R} 0 0 1 0 ${H - R}`,
    `V ${TOP_Y + R}`,
    `A ${R} ${R} 0 0 1 ${R} ${TOP_Y}`,
    'Z',
  ].join(' ');
}

/** Derive a readable display name from email local-part (no separate name field on JWT yet). */
function displayNameFromEmail(email) {
  if (!email || typeof email !== 'string') return 'User';
  const local = email.split('@')[0]?.trim() || '';
  if (!local) return 'User';
  return local
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const Navbar = () => {
  const { role, logout, token } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [ripple, setRipple] = useState(null);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);
  const [isBadgeAnimating, setIsBadgeAnimating] = useState(false);

  const menuItems = useMemo(() => [
    { name: 'Home', icon: faHouse, path: '/' },
    { name: 'Animals', icon: faStore, path: '/shop' },
    { name: 'Meat', icon: faDrumstickBite, path: '/menu-page' },
    { name: 'Cart', icon: faCartShopping, path: '/cart', isCart: true },
    { name: 'Dashboard', icon: faGauge, path: '/dashboard', isDashboard: true },
    ...(role === 'admin' ? [{ name: 'Admin', icon: faUserShield, path: '/admin' }] : []),
  ], [role]);

  useEffect(() => {
    const currentPath = location.pathname;
    
    const index = menuItems.findIndex(item => {
      if (item.path === '/') {
        return currentPath === '/';
      }
      
      // For Admin and other routes, match sub-paths
      if (item.path === '/admin') {
        return currentPath.startsWith('/admin');
      }
      if (item.path === '/dashboard') {
        return currentPath.startsWith('/dashboard');
      }
      
      return currentPath.startsWith(item.path);
    });

    const t = setTimeout(() => {
      setActiveIndex(index);
    }, 0);
    return () => clearTimeout(t);
  }, [location.pathname, menuItems]);

  useEffect(() => {
    if (cartCount > 0) {
      const t1 = setTimeout(() => setIsBadgeAnimating(true), 0);
      const t2 = setTimeout(() => setIsBadgeAnimating(false), 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [cartCount]);

  /* close on Escape — only listens while popup is open */
  useEffect(() => {
    if (!showLoginRequiredPopup) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') setShowLoginRequiredPopup(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [showLoginRequiredPopup]);

  const handleClick = (index, e) => {
    // setActiveIndex(index); // Removed: handled by useEffect/useLocation
    setRipple(index);
    setTimeout(() => setRipple(null), 600);

    const item = menuItems[index];
    if (item.isDashboard && role === 'guest') {
      e.preventDefault();
      e.stopPropagation();
      setShowLoginRequiredPopup(true);
    }
  };

  const usable = W - PAD_X * 2;
  const itemW = usable / menuItems.length;
  const ballX = activeIndex === -1 ? -100 : ((PAD_X + itemW * activeIndex + itemW / 2) / W) * 100;
  const pathD = generatePillPath(activeIndex, menuItems.length);

  return (
    <>
      {/* ── transparent overlay — catches outside clicks ── */}
      {showLoginRequiredPopup && (
        <div
          className="pnav-account-overlay"
          onClick={() => setShowLoginRequiredPopup(false)}
        />
      )}

      <div className="pnav-dock">
        <nav className="pnav-shell">

          {/* ── SVG pill shape ── */}
          <div className="pnav-svg-wrap">
            <svg
              className="pnav-svg"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pillFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#faf8f5" />
                </linearGradient>
                <linearGradient id="pillStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(212,175,55,0.06)" />
                  <stop offset="50%" stopColor="rgba(212,175,55,0.18)" />
                  <stop offset="100%" stopColor="rgba(212,175,55,0.06)" />
                </linearGradient>
              </defs>

              <path d={pathD} fill="url(#pillFill)" className="pnav-path" />
              <path
                d={pathD}
                fill="none"
                stroke="url(#pillStroke)"
                strokeWidth="1.2"
                className="pnav-path"
              />
            </svg>
          </div>

          {/* ── Floating ball ── */}
          <div 
            className="pnav-ball" 
            style={{ 
              '--ball-x': `${ballX}%`,
              opacity: activeIndex === -1 ? 0 : 1,
              visibility: activeIndex === -1 ? 'hidden' : 'visible',
              transition: 'left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s, visibility 0.3s'
            }}
          >
            <div className="pnav-ball-glow"></div>
            <div className="pnav-ball-circle">
              <FontAwesomeIcon
                icon={activeIndex === -1 ? faHouse : menuItems[activeIndex].icon}
                className="pnav-ball-icon"
                key={activeIndex}
              />
              {activeIndex !== -1 && menuItems[activeIndex].isCart && cartCount > 0 && (
                <span className="pnav-cart-badge pnav-cart-badge--ball">{cartCount}</span>
              )}
            </div>
          </div>

          {/* ── Menu items ── */}
          <ul className="pnav-list">
            {menuItems.map((item, index) => (
              <li
                key={item.path}
                className={`pnav-li${
                  activeIndex === index ? ' pnav-active' : ''
                }`}
                onClick={(e) => handleClick(index, e)}
              >
                <Link 
                  to={item.path} 
                  className="pnav-a"
                  onClick={(e) => {
                    const menuItem = menuItems[index];
                    if (menuItem.isDashboard && role === 'guest') {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowLoginRequiredPopup(true);
                    }
                  }}
                >
                  <span className="pnav-item-icon">
                    <FontAwesomeIcon icon={item.icon} />
                    {item.isCart && cartCount > 0 && (
                      <span className={`pnav-cart-badge ${isBadgeAnimating ? 'pnav-cart-badge--pop' : ''}`}>
                        {cartCount}
                      </span>
                    )}
                  </span>
                  <span className="pnav-item-label">{item.name}</span>
                  {ripple === index && <span className="pnav-ripple"></span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Login Required Popup ── */}
          {showLoginRequiredPopup && (
            <div
              className="pnav-account-popup"
              role="dialog"
              aria-label="Login required"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header row */}
              <div className="pnav-popup-header">
                <div className="pnav-popup-icon-wrap">
                  <FontAwesomeIcon
                    icon={faUserShield}
                    className="pnav-popup-icon"
                  />
                </div>
                <div className="pnav-popup-welcome-text">
                  <h3 className="pnav-popup-title">Login Required</h3>
                  <p className="pnav-popup-sub">Please login first to access the dashboard</p>
                </div>
              </div>

              {/* Gold divider */}
              <div className="pnav-popup-divider" />

              {/* Action buttons */}
              <div className="pnav-popup-actions">
                <Link
                  to="/login"
                  className="pnav-popup-btn pnav-popup-login"
                  onClick={() => setShowLoginRequiredPopup(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="pnav-popup-btn pnav-popup-sign-up"
                  onClick={() => setShowLoginRequiredPopup(false)}
                >
                  Sign Up
                </Link>
              </div>

              {/* Arrow pointing down toward Dashboard item */}
              <div className="pnav-popup-arrow" />
            </div>
          )}

        </nav>
      </div>
    </>
  );
};

export default Navbar;
