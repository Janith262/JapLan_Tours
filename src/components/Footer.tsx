import { Globe, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/context/useLanguage";

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer id="footer" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">
              <span className="text-accent">Jap</span>Lan Tours
            </h3>
            <p className="text-background/60 text-sm leading-relaxed mb-4">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-2 text-accent text-sm font-medium">
              <Globe size={16} />
              {t("footer.specialists")}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-background/90">{t("footer.quick_links")}</h4>
            <div className="space-y-2 text-sm text-background/60">
              <a href="#history" className="block hover:text-accent transition-colors">{t("footer.heritage")}</a>
              <a href="#tour-builder" className="block hover:text-accent transition-colors">{t("footer.build_tour")}</a>
              <a href="#testimonials" className="block hover:text-accent transition-colors">{t("footer.reviews")}</a>
              <a href="#faq" className="block hover:text-accent transition-colors">{t("footer.faq")}</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-background/90">{t("footer.contact_header")}</h4>
            <div className="space-y-3 text-sm text-background/60">
              <a href={`mailto:${t("footer.email")}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail size={14} className="text-accent shrink-0" />
                {t("footer.email")}
              </a>
              <a href="https://line.me/ti/p/MatnhhMPdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone size={14} className="text-accent shrink-0" />
                {t("footer.phone")}
              </a>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-accent shrink-0" />
                {t("footer.location")}
              </div>
              <a href="https://share.google/nzE28lZPjr94guuec" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                <div className="flex items-center justify-center w-3.5 h-3.5 rounded bg-white shrink-0">
                  <span className="text-[10px] font-bold text-blue-600 leading-none">G</span>
                </div>
                {language === 'ja' ? 'Google ビジネス・レビュー' : 'Google Business Profile'}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 text-center text-xs text-background/40">
          © {new Date().getFullYear()} {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
