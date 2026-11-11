import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../context/useLanguage";

// Suranga's message lives in translations.ts (organizer.*).
// Every "\n" in those texts starts a new paragraph.
const TOPICS = [1, 2, 3, 4];

const Paragraphs = ({ text, className }: { text: string; className?: string }) => (
  <div className={className}>
    {text.split("\n").map((line, i) => (
      <p key={i}>{line}</p>
    ))}
  </div>
);

const OrganizerSection = () => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const collapse = () => {
    setExpanded(false);
    // If the reader has scrolled down into the long message, bring the card back into view
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="organizer" className="py-24 bg-foreground overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">
            {t("organizer.tagline")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-background mb-4">
            {t("organizer.title")}
          </h2>
          <p className="text-background/50 max-w-xl mx-auto text-sm">
            The passionate person behind every unforgettable JapLan journey
          </p>
        </motion.div>

        {/* Card */}
        <div ref={cardRef} className="max-w-5xl mx-auto scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden border border-background/10 shadow-2xl"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)" }}
          >
            {/* Decorative golden glow */}
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)",
                transform: "translate(30%, -30%)",
              }}
            />

            <div className="flex flex-col md:flex-row items-center md:items-stretch gap-0">
              {/* Photo */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative md:w-80 shrink-0"
              >
                <div className="relative h-96 md:h-full w-full overflow-hidden">
                  <img
                    src="/organizer-new.png"
                    alt="Suranga Kumara – JapLan Tours Organizer"
                    className="h-full w-full object-cover object-center"
                  />
                  {/* Gradient overlay for blend */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-foreground/90 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-transparent to-transparent md:hidden" />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10"
              >
                {/* Name & Title */}
                <div className="mb-6">
                  <p className="text-accent font-medium tracking-widest uppercase text-xs mb-2">
                    {t("organizer.role")}
                  </p>
                  <h3 className="font-serif text-3xl md:text-4xl font-bold text-background mb-1">
                    {t("organizer.name")}
                  </h3>
                  <p className="text-background/50 text-sm">{t("organizer.location")}</p>
                </div>

                {/* Divider */}
                <div className="w-16 h-0.5 bg-accent rounded-full mb-6" />

                {/* Greeting */}
                <p className="font-serif text-2xl md:text-3xl font-bold text-background mb-1">
                  {t("organizer.greeting")}
                </p>
                <p className="font-serif text-xl md:text-2xl text-accent mb-5">{t("organizer.welcome")}</p>

                {/* Introduction */}
                <Paragraphs
                  text={t("organizer.intro")}
                  className="space-y-3 text-background/75 leading-relaxed text-base md:text-[17px] mb-8"
                />

                <button
                  type="button"
                  onClick={expanded ? collapse : () => setExpanded(true)}
                  aria-expanded={expanded}
                  aria-controls="organizer-message"
                  className="self-start inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  {expanded ? t("organizer.read_less") : t("organizer.read_more")}
                  <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
                </button>
              </motion.div>
            </div>

            {/* Full message */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id="organizer-message"
                  key="organizer-message"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="relative z-10 overflow-hidden"
                >
                  <div className="border-t border-background/10 px-8 py-10 md:px-12 md:py-12">
                    <Paragraphs
                      text={t("organizer.story")}
                      className="max-w-3xl space-y-3 text-background/75 leading-relaxed text-base md:text-lg mb-10"
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                      {TOPICS.map((n) => (
                        <div
                          key={n}
                          className="rounded-2xl border border-background/10 bg-background/5 p-6 md:p-7 hover:border-accent/30 transition-colors"
                        >
                          <h4 className="font-serif text-xl font-bold text-accent mb-4">
                            {t(`organizer.topic${n}.title`)}
                          </h4>
                          <Paragraphs
                            text={t(`organizer.topic${n}.body`)}
                            className="space-y-2.5 text-background/70 leading-relaxed text-sm md:text-[15px]"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Closing & signature */}
                    <div className="mt-12 text-center">
                      <p className="text-background/85 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                        {t("organizer.closing")}
                      </p>
                      <div className="w-16 h-0.5 bg-accent rounded-full mx-auto mb-6" />
                      <p className="font-serif text-2xl md:text-3xl font-bold text-accent mb-2">
                        {t("organizer.signature")}
                      </p>
                      <p className="font-serif italic text-background/60">{t("organizer.signature_tagline")}</p>

                      <button
                        type="button"
                        onClick={collapse}
                        className="mt-10 inline-flex items-center gap-2 text-sm text-background/50 hover:text-accent transition-colors"
                      >
                        {t("organizer.read_less")}
                        <ChevronDown size={16} className="rotate-180" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OrganizerSection;
