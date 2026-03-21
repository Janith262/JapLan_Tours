import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck, MessageSquarePlus, CheckCircle2, ImagePlus, X } from "lucide-react";
import { useLanguage } from "@/context/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminData } from "@/hooks/useAdminData";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerHeader, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const Testimonials = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { addReview, reviews: customReviews } = useAdminData();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [blurFacesRequested, setBlurFacesRequested] = useState(false);

  // Client-side compression
  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    const newImages: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      
      const reader = new FileReader();
      const readPromise = new Promise<string>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const compressed = await compressImage(reader.result as string);
            resolve(compressed);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      
      try {
        const compressedBase64 = await readPromise;
        newImages.push(compressedBase64);
      } catch (err) {
        console.error("Failed to compress image:", err);
      }
    }

    setImages(prev => [...prev, ...newImages].slice(0, 5)); // Limit to 5 images
    setIsCompressing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    // Save to Firestore via the hook
    addReview({
      name,
      country,
      city,
      rating,
      comment,
      images,
      blurFacesRequested
    });

    // Trigger Email Notification via Firebase 'mail' collection
    try {
      await addDoc(collection(db, "mail"), {
        to: "japlantours.srilanka@gmail.com",
        message: {
          subject: `New Tour Review from ${name}`,
          text: `You have received a new review!\n\nName: ${name}\nLocation: ${city}, ${country}\nRating: ${rating} Stars\nComment: ${comment}\n\nAuto-Blur Requested: ${blurFacesRequested ? "Yes" : "No"}`
        }
      });
    } catch (err) {
      console.error("Failed to enqueue email alert", err);
    }

    // Simulate submission flow and close
    setTimeout(() => {
      setIsOpen(false);
      setTimeout(() => {
        setIsSubmitted(false);
        // Reset form
        setName("");
        setCountry("");
        setCity("");
        setComment("");
        setRating(5); 
        setImages([]);
        setBlurFacesRequested(false);
      }, 300);
    }, 2000);
  };

  // Only use approved custom reviews from Firestore
  const displayReviews = customReviews
    .filter(r => r.status === "approved")
    .map(r => ({
      name: r.name,
      rating: r.rating,
      text: r.comment,
      location: `${r.city}, ${r.country}`,
      // Use approvedImages if available, fallback to original images
      images: r.approvedImages && r.approvedImages.length > 0 ? r.approvedImages : r.images
    }));

  const renderFormBody = (mobile: boolean) => {
    if (isSubmitted) {
      return (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          {mobile && (
            <DrawerClose className="absolute right-4 top-6 p-2 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none bg-muted/50 hover:bg-muted text-foreground z-10">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DrawerClose>
          )}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <CheckCircle2 size={64} className="text-[#06C755] mb-2" />
          </motion.div>
          {mobile ? (
            <DrawerTitle className="text-2xl font-serif text-foreground">{t("review_form.success_title")}</DrawerTitle>
          ) : (
            <DialogTitle className="text-2xl font-serif text-foreground">{t("review_form.success_title")}</DialogTitle>
          )}
          <p className="text-muted-foreground">{t("review_form.success_desc")}</p>
        </div>
      );
    }

    return (
      <>
        {mobile ? (
          <DrawerHeader className="px-0 pt-0 text-left relative pr-10">
            <DrawerTitle className="font-serif text-2xl">{t("review_form.title")}</DrawerTitle>
            <DrawerDescription className="pr-2">{t("review_form.description")}</DrawerDescription>
            <DrawerClose className="absolute right-0 top-0 p-2 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none bg-muted/50 hover:bg-muted text-foreground">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </DrawerHeader>
        ) : (
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{t("review_form.title")}</DialogTitle>
            <DialogDescription>{t("review_form.description")}</DialogDescription>
          </DialogHeader>
        )}
        <form onSubmit={handleSubmitReview} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">{t("review_form.name_label")}</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder={t("review_form.name_placeholder")} 
              className="w-full bg-background border-border h-11 px-4 text-base" 
              autoComplete="name" 
            />
          </div>
          <div className="space-y-2">
             <Label className="text-sm font-medium">{t("review_form.rating_label")}</Label>
             <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110 select-none [-webkit-tap-highlight-color:transparent]"
                  >
                    <Star
                      size={24}
                      className={`transition-colors ${(hoverRating || rating) >= star ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  </button>
                ))}
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">{t("review_form.country_label")}</Label>
              <Input 
                id="country" 
                value={country} 
                onChange={e => setCountry(e.target.value)} 
                required 
                placeholder={t("review_form.country_placeholder")} 
                className="w-full bg-background border-border h-11 px-4 text-base" 
                autoComplete="country-name" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">{t("review_form.city")}</Label>
              <Input 
                id="city" 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                required 
                placeholder={t("review_form.city_placeholder")} 
                className="w-full bg-background border-border h-11 px-4 text-base" 
                autoComplete="address-level2" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review_message" className="text-sm font-medium">{t("review_form.comment_label")}</Label>
            <Textarea 
              id="review_message"
              name="review_message" 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              required 
              placeholder={t("review_form.comment_placeholder")} 
              className="w-full min-h-[120px] bg-background border-border focus-visible:ring-1 focus-visible:ring-accent py-2 px-4 text-base resize-none"
              autoComplete="one-time-code"
              spellCheck={true}
            />
          </div>
          
          {/* Image Upload Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Add Photos (Optional)</Label>
              <span className="text-xs text-muted-foreground">{images.length}/5</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden group border border-border">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-white hover:text-destructive bg-black/50 rounded-full p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="w-16 h-16 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {isCompressing ? (
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImagePlus size={20} />
                  )}
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>

            {images.length > 0 && (
              <div className="flex items-start space-x-2 pt-2 pb-1">
                <Checkbox 
                  id="blurFaces" 
                  checked={blurFacesRequested}
                  onCheckedChange={(checked) => setBlurFacesRequested(checked as boolean)}
                />
                <div className="grid leading-none pt-0.5">
                  <label
                    htmlFor="blurFaces"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Request auto-blur for faces
                  </label>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Our team will use AI to blur faces in your photos for privacy.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4 sm:pb-0 pb-32">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {t("review_form.cancel")}
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:brightness-110" disabled={isCompressing}>
              {t("review_form.submit")}
            </Button>
          </div>
        </form>
      </>
    );
  };

  return (
    <section id="testimonials" className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">{t("testimonials.tagline")}</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("testimonials.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("testimonials.description")}
          </p>
        </motion.div>

        {/* Masonry grid */}
        {displayReviews.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {displayReviews.map((review, i) => (
              <motion.div
                key={review.name + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="break-inside-avoid bg-card/60 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow dark:hover:border-accent/40"
              >
                <div className="flex gap-1 mb-4 text-accent">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} size={16} className="fill-accent" />
                  ))}
                </div>
                <p className="text-foreground text-lg mb-6 leading-relaxed italic border-l-4 border-accent/30 pl-4">"{review.text}"</p>
                
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-4 snap-x no-scrollbar">
                    {review.images.map((img, idx) => (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg border border-border snap-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <img src={img} alt="Review attachment" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.location}</p>
                  </div>
                  <div className="flex items-center gap-1 text-secondary">
                    <BadgeCheck size={16} />
                    <span className="text-xs font-medium">{t("testimonials.verified_trip")}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No reviews yet. Be the first to share your experience!
          </div>
        )}

        <div className="mt-16 flex justify-center">
          {isMobile ? (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:brightness-110 font-medium px-8 h-12 rounded-xl shadow-lg border-none text-base transition-all hover:scale-105">
                  <MessageSquarePlus size={20} />
                  {t("review_form.submit_button")}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[96vh]">
                <div className="overflow-y-auto px-4 pt-4 pb-8">
                  {renderFormBody(true)}
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:brightness-110 font-medium px-8 h-12 rounded-xl shadow-lg border-none text-base transition-all hover:scale-105">
                  <MessageSquarePlus size={20} />
                  {t("review_form.submit_button")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                {renderFormBody(false)}
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Image Preview Modal */}
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
            <div className="relative">
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 z-50 p-2 text-white hover:text-white/80 transition-colors bg-black/40 rounded-full hover:bg-black/60 focus:outline-none"
              >
                <X size={24} />
              </button>
              {selectedImage && (
                <img src={selectedImage} alt="Enlarged review" className="w-full max-h-[85vh] object-contain rounded-lg" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Testimonials;

