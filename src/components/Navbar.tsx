import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/useLanguage";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t("navbar.heritage_sites"), href: "/#history" },
    { label: t("navbar.reviews"), href: "/#testimonials" },
    { label: t("navbar.faq"), href: "/#faq" },
    { label: t("navbar.contact"), href: "/#footer" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-lg shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <a href="/" className="flex items-center gap-3">
          <img 
            src="/japlan-logo.svg" 
            alt="JapLan Tours" 
            className="h-10 w-10 object-contain"
          />
          <span className="font-serif text-2xl font-bold tracking-tight">
            <span className="text-accent">Jap</span>
            <span className={scrolled ? "text-foreground" : "text-white"}>Lan Tours</span>
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                scrolled ? "text-foreground" : "text-white/90"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#tour-builder"
            className="bg-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition"
          >
            {t("navbar.plan_tour")}
          </a>

          {/* Language Toggle */}
          <div className="flex items-center gap-2 ml-4 border-l border-border pl-4">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                language === "en"
                  ? "bg-accent text-accent-foreground"
                  : scrolled
                    ? "text-foreground hover:bg-muted"
                    : "text-white/90 hover:bg-white/10"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("ja")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                language === "ja"
                  ? "bg-accent text-accent-foreground"
                  : scrolled
                    ? "text-foreground hover:bg-muted"
                    : "text-white/90 hover:bg-white/10"
              }`}
            >
              日本語
            </button>
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-4">
          {/* Language Toggle Mobile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                language === "en"
                  ? "bg-accent text-accent-foreground"
                  : scrolled
                    ? "text-foreground hover:bg-muted"
                    : "text-white/90 hover:bg-white/10"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("ja")}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                language === "ja"
                  ? "bg-accent text-accent-foreground"
                  : scrolled
                    ? "text-foreground hover:bg-muted"
                    : "text-white/90 hover:bg-white/10"
              }`}
            >
              日本語
            </button>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`${scrolled ? "text-foreground" : "text-white"}`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="flex flex-col gap-4 p-6">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground font-medium hover:text-accent transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/#tour-builder"
                onClick={() => setMobileOpen(false)}
                className="bg-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold text-center"
              >
                {t("navbar.plan_tour")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
