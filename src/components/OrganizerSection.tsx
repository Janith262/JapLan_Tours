import { motion } from "framer-motion";
import { ShieldCheck, Heart, Star } from "lucide-react";
import { useLanguage } from "../context/useLanguage";

const badges = [
  { icon: Star, label: "organizer.badge.experience" },
  { icon: Heart, label: "organizer.badge.friendly" },
  { icon: ShieldCheck, label: "organizer.badge.verified" },
];

const OrganizerSection = () => {
  const { t } = useLanguage();

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
        <div className="max-w-5xl mx-auto">
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
                    alt="W S P K Gunarathna – JapLan Tours Organizer"
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
                    W S P K Gunarathna
                  </h3>
                  <p className="text-background/50 text-sm">{t("organizer.location")}</p>
                </div>

                {/* Divider */}
                <div className="w-16 h-0.5 bg-accent rounded-full mb-6" />

                {/* Description */}
                <p className="text-background/75 leading-relaxed mb-8 text-base md:text-lg">
                  {t("organizer.description_para1")}
                  <span className="text-accent font-semibold">{t("organizer.description_para1_bold")}</span>{" "}
                  {t("organizer.description_para2")}
                  <span className="text-background font-medium">{t("organizer.description_para2_bold")}</span>{" "}
                  {t("organizer.description_para3")}
                </p>

                {/* Badges */}
                <div className="grid grid-cols-2 gap-3">
                  {badges.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 bg-background/5 hover:bg-accent/10 border border-background/10 hover:border-accent/30 rounded-xl px-4 py-3 transition-all duration-200"
                    >
                      <Icon size={16} className="text-accent shrink-0" />
                      <span className="text-background/80 text-xs font-medium">{t(label)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OrganizerSection;
