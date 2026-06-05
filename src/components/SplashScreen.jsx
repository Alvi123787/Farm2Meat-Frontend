import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/SplashScreen.css';

const SplashScreen = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="splash-content">
            <motion.div
              className="splash-logo-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for premium feel
              }}
            >
              <img
                src="https://res.cloudinary.com/dqclqmuhi/image/upload/v1775796488/Gemini_Generated_Image_1vibo61vibo61vib-removebg-preview_me9etj.png"
                alt="MeatByAlvi Logo"
                className="splash-logo"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                delay: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <h1 className="splash-text">MeatByAlvi</h1>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
