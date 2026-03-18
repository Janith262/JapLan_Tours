import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/context/useLanguage";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { useAdminData } from "@/hooks/useAdminData";

interface Site {
  name: string;
  subtitle: string;
  description: string;
  long_description: string;
  image: string;
}

const TiltCard = ({ site, index, onClick }: { site: Site; index: number; onClick: () => void }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setTilt({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl"
      onClick={onClick}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={site.image}
          alt={site.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-accent text-sm font-medium tracking-wider uppercase mb-1">{site.subtitle}</p>
        <h3 className="font-serif text-3xl font-bold text-white mb-2">{site.name}</h3>
        <p className="text-white/70 text-sm leading-relaxed">{site.description}</p>
      </div>
    </motion.div>
  );
};

const HistorySection = () => {
  const { t, language } = useLanguage();
  const { customSites, isLoadingSites } = useAdminData();
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const processedCustomSites: Site[] = customSites.map(s => ({
    name: language === 'ja' && s.nameJa ? s.nameJa : s.name,
    subtitle: language === 'ja' && s.subtitleJa ? s.subtitleJa : s.subtitle,
    description: language === 'ja' && s.descriptionJa ? s.descriptionJa : s.description,
    long_description: language === 'ja' && s.long_descriptionJa ? s.long_descriptionJa : s.long_description,
    image: s.image,
  }));

  const displaySites = processedCustomSites;

  return (
    <section id="history" className="py-24 bg-background relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">{t("history.tagline")}</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("history.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("history.description")}
          </p>
        </motion.div>

        <Dialog open={!!selectedSite} onOpenChange={(open) => !open && setSelectedSite(null)}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoadingSites && customSites.length === 0 ? (
              // Skeleton cards while loading
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                    <div className="h-4 w-24 bg-foreground/10 rounded" />
                    <div className="h-8 w-48 bg-foreground/10 rounded" />
                    <div className="h-12 w-full bg-foreground/10 rounded" />
                  </div>
                </div>
              ))
            ) : (
              displaySites.map((site, i) => (
                <DialogTrigger key={site.name + i} asChild>
                  <div>
                    <TiltCard site={site} index={i} onClick={() => setSelectedSite(site)} />
                  </div>
                </DialogTrigger>
              ))
            )}
          </div>

          <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-background sm:rounded-3xl shadow-2xl [&>button]:hidden">
            <AnimatePresence mode="wait">
              {selectedSite && (
                <motion.div
                  key={selectedSite.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-[85vh] md:h-[80vh] flex flex-col overflow-y-auto"
                >
                  <div className="relative sticky top-0 z-10 w-full min-h-[40vh] md:min-h-[50vh] shrink-0">
                    <img 
                      src={selectedSite.image} 
                      alt={selectedSite.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/10" />
                    
                    <DialogClose className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-colors">
                      <X size={24} />
                    </DialogClose>

                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 pb-16 transform translate-y-8">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-3xl mx-auto"
                      >
                        <DialogTitle className="sr-only">{selectedSite.name} Details</DialogTitle>
                        <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3 drop-shadow-md">
                          {selectedSite.subtitle}
                        </p>
                        <h2 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-xl leading-tight">
                          {selectedSite.name}
                        </h2>
                      </motion.div>
                    </div>
                  </div>

                  <div className="relative z-20 bg-background flex-1 -mt-8 pt-8 px-8 md:px-12 pb-16">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="max-w-3xl mx-auto"
                    >
                      <p className="text-xl md:text-2xl text-foreground font-light leading-relaxed mb-8 border-l-4 border-accent pl-6">
                        {selectedSite.description}
                      </p>
                      
                      <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                        <p className="text-muted-foreground leading-loose text-lg whitespace-pre-line">
                          {selectedSite.long_description}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default HistorySection;
