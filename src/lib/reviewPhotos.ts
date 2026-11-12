import type { Review } from "@/hooks/useAdminData";

/**
 * Photos of the handwritten guestbook letters, keyed by the Firestore review id
 * they belong to. The files live in public/guestbook/ and are served by the site
 * (not stored inside Firestore), so they don't slow down loading the reviews.
 *
 * To attach a photo to another guestbook review: put the file in
 * public/guestbook/ and add "<review id>": "/guestbook/<file>" below.
 */
export const GUESTBOOK_PHOTOS: Record<string, string> = {
  "1hnJa6Hkm0xELGYlb5jA": "/guestbook/hiroko.jpg",           // Hiroko
  "h7G4zgilMh9WXxxpkjjE": "/guestbook/yamagishi.jpg",        // 山岸
  "sn1pj9zwKMa6fJ91Msh1": "/guestbook/karin-mai.jpg",        // Karin (same page as Mai)
  "ONotbozY6u7YNLzI9MVs": "/guestbook/karin-mai.jpg",        // Mai (same page as Karin)
  "agtC3QlJUoOdNuWTPccw": "/guestbook/yanai.jpg",            // 柳井
  "kPYFzgzvfkR0dDOlLgou": "/guestbook/keiichiro-meiyan.jpg", // Keiichiro & Meiyan
  "24nGst2XBkcVHgksOIxl": "/guestbook/hanako-mother.jpg",    // 華子 母
  "RRWMeqAmS68XTIeRX2AL": "/guestbook/kojima.jpg",           // Runa & Keiko Kojima
  "axpYTeW9psbOPzzwcj0S": "/guestbook/watanabe.jpg",         // K. Watanabe
  "q6DsNX9hnhBlL6OfWnDZ": "/guestbook/mia-couple.jpg",       // ミア夫婦
  "UBjt46NRvrl5kAezCGId": "/guestbook/sachika.jpg",          // Sachika
  "WvELErrwFgkSBSLJeQcv": "/guestbook/kento.jpg",            // Kento
  "Ze1kocLv8BRQvgvO3Fj7": "/guestbook/marin.jpg",            // marin
  "THcDlzSLGFV998g1iqhH": "/guestbook/nozuki.jpg",           // 野月
  "ZZqSdgh6iJ00M3n9Ya6O": "/guestbook/shohei.jpg",           // Shohei
};

/** Photos to show with a review: approved photos, else uploaded photos, else its guestbook letter photo. */
export const getReviewDisplayImages = (r: Pick<Review, "id" | "images" | "approvedImages">): string[] => {
  if (r.approvedImages && r.approvedImages.length > 0) return r.approvedImages;
  if (r.images && r.images.length > 0) return r.images;
  const letter = GUESTBOOK_PHOTOS[r.id];
  return letter ? [letter] : [];
};
