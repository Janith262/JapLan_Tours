import { useState, useRef } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import {
  CheckCircle2, Trash2, Clock, Star, Download, Upload,
  Eye, EyeOff, Wand2, ChevronLeft, ChevronRight, X, ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { blurFacesInImages } from "@/lib/faceBlur";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────────────────────────────────────────────────── */
/* Helpers                                                  */
/* ──────────────────────────────────────────────────────── */

/** Download a single image URL as a file */
function downloadImage(url: string, filename: string) {
  fetch(url)
    .then(r => r.blob())
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(() => {
      // Fallback: open in new tab
      window.open(url, "_blank");
    });
}

/* ──────────────────────────────────────────────────────── */
/* Mini image carousel for admin                            */
/* ──────────────────────────────────────────────────────── */
interface ImageCarouselProps {
  images: string[];
  label: string;
}
const ImageCarousel = ({ images, label }: ImageCarouselProps) => {
  const [current, setCurrent] = useState(0);
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="relative rounded-xl overflow-hidden bg-muted border border-border" style={{ aspectRatio: "16/9", maxHeight: 220 }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt={`${label} ${current + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent(i => (i - 1 + images.length) % images.length)}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-all"
            ><ChevronLeft size={14} /></button>
            <button
              onClick={() => setCurrent(i => (i + 1) % images.length)}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-all"
            ><ChevronRight size={14} /></button>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white scale-125" : "bg-white/50"}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {current + 1}/{images.length}
        </div>
      </div>

      {/* Download row */}
      <div className="flex flex-wrap gap-1.5">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => downloadImage(url, `review_image_${i + 1}.jpg`)}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-1 transition-colors"
          >
            <Download size={10} /> Photo {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────── */
/* Per-review image management panel                        */
/* ──────────────────────────────────────────────────────── */
interface ImagePanelProps {
  reviewId: string;
  originalImages: string[];
  blurRequested: boolean;
  approvedImages?: string[];
  onApproved: () => void;
}

const ImagePanel = ({ reviewId, originalImages, blurRequested, approvedImages: existingApproved, onApproved }: ImagePanelProps) => {
  const { updateReviewApprovedImages } = useAdminData({ loadScheduled: false, loadReviews: false, loadSites: false });

  const [blurredPreviews, setBlurredPreviews] = useState<string[]>(existingApproved ?? []);
  const [isBlurring, setIsBlurring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showBlurred, setShowBlurred] = useState(!!existingApproved?.length);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>(existingApproved ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAutoBlur = async () => {
    setIsBlurring(true);
    try {
      const results = await blurFacesInImages(originalImages, 20);
      setBlurredPreviews(results);
      setUploadPreviews(results);
      setShowBlurred(true);
    } catch (e) {
      console.error("Auto blur failed", e);
    } finally {
      setIsBlurring(false);
    }
  };

  const handleManualUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArr = Array.from(files).slice(0, originalImages.length);
    const previews: string[] = new Array(fileArr.length);
    fileArr.forEach((f, i) => {
      const reader = new FileReader();
      reader.onload = e => {
        previews[i] = e.target!.result as string;
        if (previews.filter(Boolean).length === fileArr.length) {
          setUploadPreviews([...previews]);
          setShowBlurred(true);
        }
      };
      reader.readAsDataURL(f);
    });
    setUploadedFiles(fileArr);
  };

  /** Convert a File to a base64 data URL */
  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("FileReader error"));
      reader.onload = e => resolve(e.target!.result as string);
      reader.readAsDataURL(file);
    });

  /** Compress base64 images aggressively to fit inside Firestore 1MB doc limits */
  const compressImage = (base64Str: string, maxWidth = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  const handleSaveAndApprove = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      let finalUrls: string[];

      if (uploadedFiles.length > 0) {
        // Admin manually uploaded blurred files → convert to base64 data URLs
        finalUrls = await Promise.all(uploadedFiles.map(fileToDataUrl));
      } else if (blurredPreviews.length > 0) {
        // Auto-blurred results are already base64 data URLs
        finalUrls = blurredPreviews;
      } else {
        // No images processed → approve originals as-is
        finalUrls = originalImages;
      }

      // Aggressively compress images to avoid Firestore 1MB document limit
      const compressedUrls = await Promise.all(
        finalUrls.map(url => (url.startsWith('data:image') ? compressImage(url) : url))
      );

      // Store the approved image data URLs directly in Firestore (no Storage needed)
      await updateReviewApprovedImages(reviewId, compressedUrls);
      onApproved();
    } catch (e) {
      console.error("Save and approve failed", e);
      setSaveError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="mt-4 space-y-4 p-4 bg-muted/40 rounded-xl border border-border">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={13} /> Tour Photos ({originalImages.length})
        </p>
        {blurRequested && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <EyeOff size={10} /> Blur Face Requested
          </span>
        )}
      </div>

      {/* Original images */}
      <ImageCarousel images={originalImages} label="Originals" />

      {/* Actions row */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs h-8"
          onClick={handleAutoBlur}
          disabled={isBlurring}
        >
          {isBlurring ? (
            <>
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" strokeOpacity={0.3} />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Detecting Faces…
            </>
          ) : (
            <><Wand2 size={13} /> Auto Blur Faces (AI)</>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs h-8"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={13} /> Upload Blurred Images
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleManualUpload(e.target.files)}
        />

        {(blurredPreviews.length > 0 || uploadPreviews.length > 0) && (
          <button
            onClick={() => setShowBlurred(v => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors h-8 px-2"
          >
            {showBlurred ? <Eye size={13} /> : <EyeOff size={13} />}
            {showBlurred ? "Hide preview" : "Show blurred preview"}
          </button>
        )}
      </div>

      {/* Blurred / uploaded preview */}
      <AnimatePresence>
        {showBlurred && uploadPreviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ImageCarousel images={uploadPreviews} label="Preview (to be published)" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {saveError && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{saveError}</p>
      )}

      {/* Save & Approve */}
      <Button
        onClick={handleSaveAndApprove}
        disabled={isSaving}
        className="w-full gap-2 bg-[#06C755] hover:bg-[#06C755]/90 text-white h-9 text-sm"
      >
        {isSaving ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" strokeOpacity={0.3} />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Saving & Approving…
          </>
        ) : (
          <><CheckCircle2 size={16} /> Save & Approve Review</>
        )}
      </Button>
    </div>
  );
};

/* ──────────────────────────────────────────────────────── */
/* Main reviews manager                                     */
/* ──────────────────────────────────────────────────────── */
const ReviewsManager = () => {
  const { reviews, approveReview, deleteReview, isLoadingReviews } = useAdminData({ loadReviews: true, loadSites: false, loadScheduled: false });
  const [expandedImages, setExpandedImages] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedImages(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoadingReviews) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-border">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground animate-pulse">Fetching reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
        <p className="text-muted-foreground">No customer reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Main card row */}
          <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-lg">{review.name}</h3>
                <span className="text-sm text-muted-foreground">{review.city}, {review.country}</span>
                {review.status === "approved" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#06C755]/10 text-[#06C755]">
                    <CheckCircle2 size={14} /> Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
                    <Clock size={14} /> Pending
                  </span>
                )}
                {review.blurFacesRequested && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    <EyeOff size={10} /> Blur Requested
                  </span>
                )}
                {review.images && review.images.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <ImageIcon size={10} /> {review.images.length} photo{review.images.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="flex text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < review.rating ? "fill-current" : "text-muted"} />
                ))}
              </div>

              <p className="text-card-foreground text-sm italic border-l-2 border-accent pl-3">"{review.comment}"</p>
              <p className="text-xs text-muted-foreground">
                Submitted: {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
              {/* Show images button */}
              {review.images && review.images.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => toggleExpand(review.id)}
                >
                  <ImageIcon size={14} />
                  {expandedImages.has(review.id) ? "Hide Photos" : "Manage Photos"}
                  {expandedImages.has(review.id) ? <X size={12} className="ml-0.5" /> : null}
                </Button>
              )}

              {/* Approve (no images case) */}
              {review.status === "pending" && (!review.images || review.images.length === 0) && (
                <Button onClick={() => approveReview(review.id)} className="gap-2 bg-[#06C755] hover:bg-[#06C755]/90 text-white text-sm">
                  <CheckCircle2 size={16} /> Approve
                </Button>
              )}

              <Button 
                variant="destructive" 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this review?")) {
                    deleteReview(review.id);
                  }
                }} 
                className="gap-2 text-sm"
              >
                <Trash2 size={16} /> Delete
              </Button>
            </div>
          </div>

          {/* Expandable image management panel */}
          <AnimatePresence>
            {review.images && review.images.length > 0 && expandedImages.has(review.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="p-6 pt-4">
                  <ImagePanel
                    reviewId={review.id}
                    originalImages={review.images}
                    blurRequested={!!review.blurFacesRequested}
                    approvedImages={review.approvedImages}
                    onApproved={() => toggleExpand(review.id)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default ReviewsManager;
