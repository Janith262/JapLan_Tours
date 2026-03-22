import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle, Truck, Calendar, Wallet, MapPin } from "lucide-react";
import { useLanguage } from "@/context/useLanguage";

const FAQ = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("reservations");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const categories = [
    { id: "reservations", icon: Wallet, label: t("faq.cat.reservations") },
    { id: "drivers", icon: Truck, label: t("faq.cat.drivers") },
    { id: "contents", icon: Calendar, label: t("faq.cat.contents") },
    { id: "tip", icon: MessageCircle, label: t("faq.cat.tip") },
    { id: "preparing", icon: MapPin, label: t("faq.cat.preparing") },
  ];

  const faqData: Record<string, { q: string; a: string }[]> = {
    reservations: [
      { q: t("faq.res.q1"), a: t("faq.res.a1") },
      { q: t("faq.res.q2"), a: t("faq.res.a2") },
      { q: t("faq.res.q3"), a: t("faq.res.a3") },
      { q: t("faq.res.q4"), a: t("faq.res.a4") },
    ],
    drivers: [
      { q: t("faq.drv.q1"), a: t("faq.drv.a1") },
      { q: t("faq.drv.q2"), a: t("faq.drv.a2") },
      { q: t("faq.drv.q3"), a: t("faq.drv.a3") },
      { q: t("faq.drv.q4"), a: t("faq.drv.a4") },
      { q: t("faq.drv.q5"), a: t("faq.drv.a5") },
      { q: t("faq.drv.q6"), a: t("faq.drv.a6") },
    ],
    contents: [
      { q: t("faq.sch.q1"), a: t("faq.sch.a1") },
      { q: t("faq.sch.q2"), a: t("faq.sch.a2") },
      { q: t("faq.sch.q3"), a: t("faq.sch.a3") },
      { q: t("faq.sch.q4"), a: t("faq.sch.a4") },
    ],
    tip: [
      { q: t("faq.tip.q1"), a: t("faq.tip.a1") },
    ],
    preparing: [
      { q: t("faq.pre.q1"), a: t("faq.pre.q1_a") },
      { q: t("faq.pre.q2"), a: t("faq.pre.q2_a") },
    ],
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setExpandedIndex(null);
  };

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">
            {t("faq.tagline")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("faq.title")}
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* Category Tabs */}
          <div className="lg:w-1/3 flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                  activeCategory === cat.id
                    ? "bg-accent/10 border-accent/30 text-accent font-semibold"
                    : "bg-card/50 border-border/50 text-muted-foreground hover:bg-card hover:border-border"
                }`}
              >
                <div className={`p-2 rounded-lg ${activeCategory === cat.id ? "bg-accent text-white" : "bg-muted"}`}>
                  <cat.icon size={20} />
                </div>
                <span className="text-left">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="lg:w-2/3">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {faqData[activeCategory].map((item, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-accent/5"
                  >
                    <span className="font-semibold text-foreground pr-8 text-lg md:text-xl">
                      {item.q}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                      className="text-accent shrink-0"
                    >
                      <ChevronDown size={24} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="p-5 pt-0 border-t border-border/10">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base md:text-lg">
                            {item.a}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
