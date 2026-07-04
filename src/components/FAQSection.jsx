import { useState, useRef, useEffect } from "react";
import "../css/FAQSection.css";

const faqs = [
  {
    question: "How do I know the meat is fresh when it arrives?",
    answer:
      "All orders are cut to order on the same day of delivery. We use insulated packaging to maintain temperature during transit, and every item is sourced fresh from our farm partners each morning. You can also request a live video of your cut before dispatch via WhatsApp.",
  },
  {
    question: "Can I customize my cut — size, boneless, or special portions?",
    answer:
      "Absolutely. We offer custom cuts on all major items including mutton, beef, and chicken. Just mention your requirements in the WhatsApp order or add a note at checkout. Our butchers will prepare it exactly to your specification at no extra charge.",
  },
  {
    question: "What is your delivery area and how long does it take?",
    answer:
      "We currently deliver for Rs. 49 within Rahim Yar Khan city. Orders placed before 12 PM are typically delivered the same day. For areas outside RYK, delivery is available with a small charge — contact us on WhatsApp to confirm your location and timing.",
  },
  {
    question: "What if I'm not satisfied with the quality after delivery?",
    answer:
      "We stand behind every order with a return and replacement policy. If the weight is incorrect, the cut doesn't match your order, or you're unhappy with the quality for any reason, contact us within 24 hours of delivery and we'll make it right — no questions asked.",
  },
  {
    question:
      "How are your prices determined, and is negotiation possible?",
    answer:
      "Our prices are set per kilogram based on daily market rates and are updated regularly on the site. For bulk orders — such as weddings, events, or large family purchases — price negotiation is available. Reach out via WhatsApp and we'll work out a fair deal personally.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [heights, setHeights] = useState({});
  const answerRefs = useRef([]);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    // Calculate heights on mount
    const calculateHeights = () => {
      const newHeights = {};
      answerRefs.current.forEach((ref, index) => {
        if (ref) {
          newHeights[index] = `${ref.scrollHeight}px`;
        }
      });
      setHeights(newHeights);
    };

    calculateHeights();

    // Recalculate on window resize to handle responsive changes
    window.addEventListener('resize', calculateHeights);
    return () => window.removeEventListener('resize', calculateHeights);
  }, []);

  const getMaxHeight = (index) => {
    return openIndex === index ? heights[index] || "0px" : "0px";
  };

  return (
    <section className="faq">
      <div className="faq__container">
        {/* Section Header */}
        <div className="faq__header">
          <div className="faq__header-badge">
            <span className="faq__header-line" />
            <span className="faq__header-label">Got Questions?</span>
            <span className="faq__header-line" />
          </div>
          <h2 className="faq__title">Frequently Asked Questions</h2>
          <p className="faq__subtitle">
            Everything you need to know about our meat, cuts, and delivery.
          </p>
        </div>

        {/* Accordion */}
        <div className="faq__list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq__item ${openIndex === index ? "faq__item--open" : ""}`}
            >
              <button
                className="faq__question"
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index}
              >
                <span className="faq__question-text">{faq.question}</span>
                <span className="faq__icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div
                className="faq__answer-wrapper"
                style={{
                  maxHeight: getMaxHeight(index),
                  opacity: openIndex === index ? 1 : 0,
                }}
              >
                <div
                  className="faq__answer"
                  ref={(el) => (answerRefs.current[index] = el)}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;