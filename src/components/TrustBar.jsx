import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faWeightHanging,
  faHeartPulse,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import "../css/TrustBar.css";

const trustItems = [
  {
    icon: faTruck,
    title: "Free Delivery",
    subtitle: "On all orders",
    color: "45, 135, 90",
    accentHex: "#2D875A",
  },
  {
    icon: faWeightHanging,
    title: "100% Original",
    subtitle: "Verified & authentic",
    color: "128, 0, 0",
    accentHex: "#800000",
  },
  {
    icon: faHeartPulse,
    title: "Health Certified",
    subtitle: "Quality assured livestock",
    color: "192, 57, 43",
    accentHex: "#C0392B",
  },
  {
    icon: faMoneyBillWave,
    title: "Cash on Delivery",
    subtitle: "Pay at your doorstep",
    color: "163, 130, 35",
    accentHex: "#A38223",
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
    <div className="container-fluid px-lg-3 px-2">
      <div
        className={`tb-wrapper mt-2 ${isVisible ? "tb-visible" : ""}`}
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
    </div>
  );
};

export default TrustBar;