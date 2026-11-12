import { useState } from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck, Quote, ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/context/useLanguage";
import { useAdminData, formatReviewLocation, getReviewDate, formatReviewDateTime } from "@/hooks/useAdminData";
import { getReviewDisplayImages } from "@/lib/reviewPhotos";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// How many reviews this short section shows. Every review is in the full
// "Traveler Stories" section (Testimonials.tsx) further down the page.
const HIGHLIGHT_COUNT = 3;

const ReviewHighlights = () => {
  const { t, language } = useLanguage();
  const { reviews, isLoadingReviews } = useAdminData({ loadReviews: true, loadSites: false, loadScheduled: false });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const approved = reviews.filter((r) => r.status === "approved");
  // Reviews arrive newest first, so this shows the latest approved reviews
  const highlights = approved.slice(0, HIGHLIGHT_COUNT);
  const averageRating = approved.length
    ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
    : 0;

  // Nothing approved yet: hide the section instead of showing an empty block
  if (!isLoadingReviews && approved.length === 0) return null;

  const showSkeleton = isLoadingReviews && approved.length === 0;

  return (
    <section id="review-highlights" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">{t("highlights.tagline")}</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t("highlights.title")}
          </h2>

          {approved.length > 0 && (
            <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-border bg-card/60 px-5 py-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(averageRating) ? "fill-accent text-accent" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                {t("highlights.summary").replace("{count}", String(approved.length))}
              </span>
            </div>
          )}
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {showSkeleton
            ? Array.from({ length: HIGHLIGHT_COUNT }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/50 bg-card/60 p-6 lg:p-8 space-y-4 animate-pulse">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-2/3 rounded bg-muted" />
                  </div>
                  <div className="h-10 w-32 rounded bg-muted" />
                </div>
              ))
            : highlights.map((review, i) => {
                // Guestbook letters were typed up later, so their createdAt is not when they were written
                const date = review.source === "guestbook" ? null : getReviewDate(review.createdAt);
                const images = getReviewDisplayImages(review);
                return (
                <motion.article
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col bg-card/60 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow dark:hover:border-accent/40"
                >
                  <Quote size={40} className="absolute top-6 right-6 text-accent/15" aria-hidden="true" />

                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star key={idx} size={16} className="fill-accent text-accent" />
                    ))}
                  </div>

                  <p className="text-foreground leading-relaxed mb-6 whitespace-pre-line line-clamp-6">
                    {review.comment}
                  </p>

                  {images.length > 0 && (
                    <div className="flex gap-2 mb-6">
                      {images.slice(0, 3).map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImage(img)}
                          className="w-16 h-20 shrink-0 overflow-hidden rounded-lg border border-border hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          <img src={img} alt="Review photo" className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{review.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {review.source === "guestbook" ? t("testimonials.guestbook") : formatReviewLocation(review)}
                      </p>
                      {date && (
                        <time dateTime={date.toISOString()} className="block text-[11px] text-muted-foreground/80 mt-0.5">
                          {formatReviewDateTime(date, language)}
                        </time>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-secondary shrink-0">
                      <BadgeCheck size={16} />
                      <span className="text-xs font-medium">{t("testimonials.verified_trip")}</span>
                    </div>
                  </div>
                </motion.article>
                );
              })}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="#testimonials"
            className="group inline-flex items-center gap-2 h-12 px-8 rounded-xl border border-accent/60 text-foreground font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
          >
            {t("highlights.read_all")}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Enlarged photo */}
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
            <DialogTitle className="sr-only">Review photo</DialogTitle>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                aria-label="Close"
                className="absolute -top-12 right-0 z-50 p-2 text-white hover:text-white/80 transition-colors bg-black/40 rounded-full hover:bg-black/60 focus:outline-none"
              >
                <X size={24} />
              </button>
              {selectedImage && (
                <img src={selectedImage} alt="Enlarged review photo" className="w-full max-h-[85vh] object-contain rounded-lg" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ReviewHighlights;
