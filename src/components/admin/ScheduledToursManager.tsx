import { useState } from "react";
import { useAdminData, ScheduledTourDay, ScheduledTourImage } from "@/hooks/useAdminData";
import { Trash2, Plus, Image as ImageIcon, CopyPlus, Edit, Bold, Italic, Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ScheduledToursManager = () => {
  const { scheduledTours, addScheduledTour, updateScheduledTour, deleteScheduledTour, isLoadingScheduled } = useAdminData({ loadScheduled: true, loadReviews: false, loadSites: false });
  const [isAdding, setIsAdding] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /** Helper to compress image base64 before saving to Firestore */
  const compressImage = (base64Str: string, maxWidth = 1200, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
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

  // Form State
  const [heroImage, setHeroImage] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [destinations, setDestinations] = useState("");
  const [priceYen, setPriceYen] = useState("");
  
  // Dynamic Days Array
  const [days, setDays] = useState<ScheduledTourDay[]>([{ title: "■Day 1", desc: "" }]);
  
  // Dynamic Gallery Array
  const [gallery, setGallery] = useState<ScheduledTourImage[]>([]);

  const handleEdit = (tour: any) => {
    setHeroImage(tour.heroImage || "");
    setDurationDays(tour.durationDays || "");
    setDestinations(tour.destinations || "");
    setPriceYen(tour.priceYen || "");
    setDays(tour.days && tour.days.length > 0 ? tour.days : [{ title: "■Day 1", desc: "" }]);
    setGallery(tour.gallery || []);
    setEditingTourId(tour.id);
    setIsAdding(true);
  };

  const insertFormatting = (idx: number, startTag: string, endTag: string) => {
    const textarea = document.getElementById(`day-desc-${idx}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = days[idx].desc;

    const before = text.substring(0, start);
    const selected = text.substring(start, end) || "text";
    const after = text.substring(end);

    const newText = `${before}${startTag}${selected}${endTag}${after}`;
    const newDays = [...days];
    newDays[idx].desc = newText;
    setDays(newDays);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + selected.length);
    }, 0);
  };

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string);
      setHeroImage(compressed);
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string, 600, 0.5);
      const newGallery = [...gallery];
      newGallery[index].imageUrl = compressed;
      setGallery(newGallery);
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompressing) {
      alert("Please wait for images to finish compressing.");
      return;
    }
    if (!heroImage) {
      alert("Please upload a hero image.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingTourId) {
        await updateScheduledTour(editingTourId, {
          heroImage,
          durationDays,
          destinations,
          priceYen,
          days,
          gallery,
        });
      } else {
        await addScheduledTour({
          heroImage,
          durationDays,
          destinations,
          priceYen,
          days,
          gallery,
        });
      }

      // Reset
      setHeroImage("");
      setDurationDays("");
      setDestinations("");
      setPriceYen("");
      setDays([{ title: "■Day 1", desc: "" }]);
      setGallery([]);
      setEditingTourId(null);
      setIsAdding(false);
    } catch (error: any) {
      console.error("Database Error:", error);
      alert("Failed to save the tour. " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold">Manage Scheduled Tours</h2>
        <Button onClick={() => { 
            setIsAdding(!isAdding); 
            if (!isAdding) { /* going to add mode, clear edit state */
              setEditingTourId(null); setHeroImage(""); setDurationDays(""); setDestinations(""); setPriceYen(""); setDays([{ title: "■Day 1", desc: "" }]); setGallery([]);
            }
          }} className="gap-2">
          {isAdding ? "Cancel" : <><Plus size={16} /> Add New Tour</>}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-6 rounded-xl border border-border space-y-8">
          
          {/* Header Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Primary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2 md:col-span-2">
                <Label>Hero Background Image</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input type="file" accept="image/*" onChange={handleHeroUpload} className="cursor-pointer" />
                </div>
                {heroImage && (
                  <div className="mt-4 relative rounded-lg border border-border overflow-hidden h-40 bg-muted/50 flex items-center justify-center">
                    {isCompressing ? <span className="animate-pulse text-sm">Compressing...</span> : (
                      <>
                        <img src={heroImage} alt="Preview" className="w-full h-full object-cover" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={() => setHeroImage("")}>
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Duration (e.g., "3 days")</Label>
                <Input required value={durationDays} onChange={e => setDurationDays(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Destinations (e.g., "Sigiriya/Dambulla/Kandy")</Label>
                <Input required value={destinations} onChange={e => setDestinations(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Price in Yen (e.g., "¥ 75,000")</Label>
                <Input required value={priceYen} onChange={e => setPriceYen(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Itinerary Matrix */}
          <div className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg">Daily Itinerary</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setDays([...days, { title: `■Day ${days.length + 1}`, desc: "" }])}>
                  <CopyPlus size={16} className="mr-2" /> Add Day
                </Button>
             </div>
             
             <div className="space-y-4">
               {days.map((day, idx) => (
                 <div key={idx} className="p-4 border rounded-lg bg-background relative pr-12">
                   <div className="space-y-2">
                     <Label>Day Title</Label>
                     <Input required value={day.title} onChange={e => { const newDays = [...days]; newDays[idx].title = e.target.value; setDays(newDays); }} />
                     
                     <div className="flex items-center justify-between">
                       <Label>Day Description</Label>
                       <div className="flex gap-1 border border-border rounded-md p-1 bg-muted/50">
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => insertFormatting(idx, "<b>", "</b>")} title="Bold">
                             <Bold size={14} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => insertFormatting(idx, "<i>", "</i>")} title="Italic">
                             <Italic size={14} />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => insertFormatting(idx, "<mark class='bg-[#3FA162]/20 px-1 rounded font-semibold'>", "</mark>")} title="Highlight">
                             <Highlighter size={14} />
                          </Button>
                       </div>
                     </div>
                     <Textarea id={`day-desc-${idx}`} required className="min-h-[100px]" placeholder="Activities schedule..." value={day.desc} onChange={e => { const newDays = [...days]; newDays[idx].desc = e.target.value; setDays(newDays); }} />
                   </div>
                   
                   {days.length > 1 && (
                     <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => setDays(days.filter((_, i) => i !== idx))}>
                       <Trash2 size={16} />
                     </Button>
                   )}
                 </div>
               ))}
             </div>
          </div>

          {/* Image Gallery */}
          <div className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg">Image Gallery Array</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setGallery([...gallery, { imageUrl: "", caption: "" }])}>
                  <CopyPlus size={16} className="mr-2" /> Add Image
                </Button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {gallery.map((img, idx) => (
                 <div key={idx} className="p-4 border rounded-lg bg-background relative space-y-4">
                   <div className="space-y-2">
                     <Label>Select Image</Label>
                     <Input type="file" accept="image/*" onChange={(e) => handleGalleryImageUpload(idx, e)} />
                     {img.imageUrl && (
                        <div className="h-32 rounded bg-muted/50 overflow-hidden">
                           <img src={img.imageUrl} alt="preview" className="w-full h-full object-cover" />
                        </div>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label>Caption</Label>
                     <Input placeholder="e.g. Sigiriya Rock" value={img.caption} onChange={e => { const newG = [...gallery]; newG[idx].caption = e.target.value; setGallery(newG); }} />
                   </div>
                   <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}>
                     <Trash2 size={12} />
                   </Button>
                 </div>
               ))}
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingTourId(null); }} disabled={isSaving}>Cancel</Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:brightness-110" disabled={isSaving || isCompressing}>
               {isSaving ? "Saving..." : editingTourId ? "Update Tour" : "Save Tour"}
            </Button>
          </div>
        </form>
      )}

      {/* List Tours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingScheduled ? (
          <div className="col-span-full text-center py-20">Loading tours...</div>
        ) : (
          scheduledTours.map(tour => (
            <div key={tour.id} className="bg-card rounded-xl overflow-hidden border border-border shadow-sm group">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {tour.heroImage ? <img src={tour.heroImage} alt={tour.destinations} className="w-full h-full object-cover" /> : <ImageIcon />}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                  <span className="font-bold text-lg">{tour.durationDays}</span>
                  <span className="text-sm px-4 text-center">{tour.destinations}</span>
                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(tour)}>
                      <Edit size={16} className="mr-2" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this scheduled tour?")) {
                          deleteScheduledTour(tour.id);
                        }
                      }}
                    >
                      <Trash2 size={16} className="mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold capitalize">{tour.destinations}</h3>
                <p className="text-sm text-muted-foreground">{tour.priceYen}</p>
                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                   <span>{tour.days.length} Days Planner</span>
                   <span>{tour.gallery.length} Images</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduledToursManager;
