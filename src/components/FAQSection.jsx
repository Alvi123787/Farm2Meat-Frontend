import React, { useState } from "react";
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
    question: "How are your prices determined, and is negotiation possible?",
    answer:
      "Our prices are set per kilogram based on daily market rates and are updated regularly on the site. For bulk orders — such as weddings, events, or large family purchases — price negotiation is available. Reach out via WhatsApp and we'll work out a fair deal personally.",
  },
];

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="faq-section">
      {/* Decorative blobs */}
      <div className="faq-blob faq-blob--1" aria-hidden="true" />
      <div className="faq-blob faq-blob--2" aria-hidden="true" />

      <div className="container-fluid px-lg-5">
        {/* Header */}
        <div className="faq-header">
          <span className="faq-eyebrow">Got Questions?</span>
          <h2 className="faq-title">
            Frequently Asked <span className="faq-title__accent">Questions</span>
          </h2>
          <div className="faq-rule" />
          <p className="faq-subtitle">
            Everything you need to know about ordering fresh, halal meat from MeatByAlvi.
          </p>
        </div>

        {/* Accordion */}
        <div className="faq-list" role="list">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`faq-item${isOpen ? " faq-item--open" : ""}`}
                role="listitem"
              >
                <button
                  className="faq-trigger"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-btn-${i}`}
                >
                  <span className="faq-trigger__num">0{i + 1}</span>
                  <span className="faq-trigger__question">{faq.question}</span>
                  <span className="faq-trigger__icon" aria-hidden="true">
                    {isOpen ? <MinusIcon /> : <PlusIcon />}
                  </span>
                </button>

                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  className="faq-panel"
                  style={{ "--faq-panel-height": isOpen ? "var(--faq-natural-height)" : "0px" }}
                >
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}