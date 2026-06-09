import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component ensures that the window scrolls to the top
 * whenever the route changes. This is particularly useful for mobile users.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use "instant" to avoid seeing the scroll animation on every page load
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
