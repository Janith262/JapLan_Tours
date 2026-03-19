import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/useLanguage";
import heroImg from "@/assets/sigiriya-hero.jpg";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax BG */}
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-fixed"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-accent font-medium tracking-[0.3em] uppercase text-sm mb-6"
        >
          {t("hero.tagline")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-4"
        >
          {t("hero.title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-4 font-light"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="text-white/50 text-base mb-10 font-serif italic"
        >
          {t("hero.flair")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <a
            href="#tour-builder"
            className="inline-block bg-accent text-accent-foreground px-10 py-4 rounded-xl text-lg font-semibold hover:brightness-110 hover:scale-105 transition-all duration-300 shadow-2xl shadow-accent/30"
          >
            {t("hero.cta")}
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
};

export default Hero;
