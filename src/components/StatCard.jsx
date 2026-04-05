// StatCard.jsx
import { useState, useEffect, useRef } from "react";
import "../css/StatsOverview.css";

export default function StatCard({
  title = "Stat Title",
  value = "0",
  trend = null,
  icon = "fa-chart-bar",
  accentColor = "primary",
  index = 0,
}) {
  const [displayValue, setDisplayValue] = useState("0");
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const currentRef = cardRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, index * 120);
          observer.unobserve(currentRef);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [index]);

  useEffect(() => {
    if (!isVisible) return;

    const cleanValue = value.replace(/,/g, "");
    const numericMatch = cleanValue.match(/(\d+)/);

    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const target = parseInt(numericMatch[1], 10);
    const prefix = value.substring(
      0,
      value.replace(/,/g, "").indexOf(numericMatch[0])
    );

    const originalNumStr = value.substring(
      prefix.length,
      prefix.length + numericMatch[0].length + (value.length - cleanValue.length)
    );
    const suffix = value.substring(prefix.length + originalNumStr.length);

    const duration = 1400;
    const steps = 50;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * eased);
      const formatted = current.toLocaleString();
      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const accentClasses = {
    primary: "accent-primary",
    gold: "accent-gold",
    green: "accent-green",
    orange: "accent-orange",
  };

  const trendIcon =
    trend?.direction === "up" ? "fa-arrow-trend-up" : "fa-arrow-trend-down";
  const trendClass =
    trend?.direction === "up" ? "trend-positive" : "trend-negative";

  return (
    <div
      className={`stat-card ${accentClasses[accentColor] || "accent-primary"} ${
        isVisible ? "card-visible" : "card-hidden"
      }`}
      ref={cardRef}
    >
      <div className="stat-accent-strip" />

      <div className="stat-card-inner">
        <div className="stat-header">
          <span className="stat-title">{title}</span>
          <div className="stat-icon-wrapper">
            <i className={`fa-solid ${icon}`} />
          </div>
        </div>

        <div className="stat-value-row">
          <h3 className="stat-value">{isVisible ? displayValue : "—"}</h3>
        </div>

        {trend && (
          <div className="stat-footer">
            <div className={`stat-trend ${trendClass}`}>
              <i className={`fa-solid ${trendIcon}`} />
              <span className="trend-value">{trend.value}</span>
            </div>
            <span className="trend-label">{trend.label}</span>
          </div>
        )}

        <div className="stat-sparkline">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            {trend?.direction === "up" ? (
              <path
                d="M0,25 Q10,22 20,20 T40,15 T60,12 T80,8 T100,5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M0,8 Q10,10 20,12 T40,15 T60,18 T80,22 T100,25"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
