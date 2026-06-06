// TrustBar.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMotorcycle,
  faCheckCircle,
  faBoxOpen,      // New icon for packaging
  faAward,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import "../css/TrustBar.css";

const trustItems = [
  {
    icon: faMotorcycle,
    title: "Delivery for 50 Rs",
    subtitle: "Rahim Yar Khan only",
    color: "212, 175, 55",
    accentHex: "#D4AF37",
  },
  {
    icon: faCheckCircle,
    title: "100% Halal Certified",
    subtitle: "Authentic zabiha process",
    color: "46, 139, 87",
    accentHex: "#2E8B57",
  },
  {
    icon: faBoxOpen,               // Packaging icon
    title: "Clean Packaging",       // Updated title
    subtitle: "Tray, wrap & quality bag",  // Short description
    color: "85, 107, 47",          // Olive green to signal freshness & packaging
    accentHex: "#556B2F",
  },
  {
    icon: faAward,
    title: "Premium Quality Cuts",
    subtitle: "Hand‑trimmed & hygienic",
    color: "192, 57, 43",
    accentHex: "#C0392B",
  },
];

const TrustBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`tb-wrapper ${isVisible ? "tb-visible" : ""}`}
      ref={barRef}
    >
        {/* Animated Top Border */}
        <div className="tb-top-line"></div>

        <div className="tb-inner">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="tb-item"
              style={{
                "--item-color": item.color,
                "--item-accent": item.accentHex,
                "--delay": `${index * 0.12}s`,
              }}
            >
              {/* Hover Glow */}
              <div className="tb-item-glow"></div>

              {/* Icon */}
              <div className="tb-icon-box">
                <div className="tb-icon-ring"></div>
                <div className="tb-icon-inner">
                  <FontAwesomeIcon icon={item.icon} className="tb-icon" />
                </div>
              </div>

              {/* Text */}
              <div className="tb-text">
                <h4 className="tb-title">{item.title}</h4>
                <p className="tb-sub">{item.subtitle}</p>
              </div>

              {/* Divider (not on last item) */}
              {index < trustItems.length - 1 && (
                <div className="tb-divider-line"></div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Accent */}
        <div className="tb-bottom-line"></div>
      </div>
  );
};

export default TrustBar;