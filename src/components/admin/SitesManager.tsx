import { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SitesManager = () => {
  const { customSites, addSite, deleteSite, isLoadingSites } = useAdminData({ loadSites: true, loadReviews: false, loadScheduled: false });
  const [isAdding, setIsAdding] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

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
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");

  // Japanese Form State
  const [nameJa, setNameJa] = useState("");
  const [subtitleJa, setSubtitleJa] = useState("");
  const [descriptionJa, setDescriptionJa] = useState("");
  const [longDescriptionJa, setLongDescriptionJa] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      // Compress the image before setting it to state
      const compressed = await compressImage(reader.result as string);
      setImage(compressed);
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image or provide a URL.");
      return;
    }

    addSite({
      name,
      subtitle,
      image,
      description,
      long_description: longDescription,
      nameJa: nameJa || undefined,
      subtitleJa: subtitleJa || undefined,
      descriptionJa: descriptionJa || undefined,
      long_descriptionJa: longDescriptionJa || undefined,
    });

    // Reset form
    setName("");
    setSubtitle("");
    setImage("");
    setDescription("");
    setLongDescription("");
    setNameJa("");
    setSubtitleJa("");
    setDescriptionJa("");
    setLongDescriptionJa("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-bold">Manage Heritage Sites</h2>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? "Cancel" : <><Plus size={16} /> Add New Site</>}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-6 rounded-xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Headline (Name)</Label>
              <Input required placeholder="e.g. Sigiriya" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Eyebrow Text (Subtitle)</Label>
              <Input required placeholder="e.g. THE LION ROCK" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Image</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full sm:w-1/2 cursor-pointer"
                />
                <div className="flex items-center gap-4 w-full sm:w-1/2">
                  <span className="text-muted-foreground text-sm font-medium">OR</span>
                  <Input
                    placeholder="Paste Image URL..."
                    value={image.startsWith('data:') ? '' : image}
                    onChange={e => setImage(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              {image && (
                <div className="mt-4 relative rounded-lg border border-border overflow-hidden h-48 sm:h-64 object-cover bg-muted/50 flex items-center justify-center">
                  {isCompressing ? (
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-xs text-muted-foreground">Compressing...</span>
                    </div>
                  ) : (
                    <>
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => setImage("")}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Lead Paragraph (Short Description)</Label>
              <Textarea required placeholder="A 5th-century rock fortress rising 200m..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Body (Long Description for Blog Modal)</Label>
              <Textarea required className="min-h-[150px]" placeholder="Sigiriya, the Lion Rock, is an ancient rock fortress..." value={longDescription} onChange={e => setLongDescription(e.target.value)} />
            </div>

            <div className="space-y-4 col-span-1 md:col-span-2 mt-4">
              <h3 className="font-semibold border-b pb-2">Japanese Content (Optional)</h3>
            </div>

            <div className="space-y-2">
              <Label>Headline JA (Name)</Label>
              <Input placeholder="e.g. シギリヤ" value={nameJa} onChange={e => setNameJa(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Eyebrow Text JA (Subtitle)</Label>
              <Input placeholder="e.g. ライオンロック" value={subtitleJa} onChange={e => setSubtitleJa(e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Lead Paragraph JA (Short Description)</Label>
              <Textarea placeholder="ジャングルの上200mそびえる..." value={descriptionJa} onChange={e => setDescriptionJa(e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Body JA (Long Description)</Label>
              <Textarea className="min-h-[150px]" placeholder="ライオンロックとも呼ばれるシギリヤは..." value={longDescriptionJa} onChange={e => setLongDescriptionJa(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:brightness-110">Save Site</Button>
          </div>
        </form>
      )}

      {/* List Existing Custom Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingSites ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-border">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground animate-pulse">Loading heritage sites...</p>
          </div>
        ) : (
          <>
            {customSites.map(site => (
              <div key={site.id} className="bg-card rounded-xl overflow-hidden border border-border shadow-sm group">
                <div className="aspect-video relative overflow-hidden bg-muted flex flex-col items-center justify-center">
                  {site.image ? (
                    <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-muted-foreground/50 opacity-50" size={48} />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={() => deleteSite(site.id)} className="gap-2">
                      <Trash2 size={16} /> Delete Site
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-accent uppercase font-medium tracking-wide mb-1">{site.subtitle}</p>
                  <h3 className="font-serif text-xl font-bold mb-2">{site.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2" title={site.description}>{site.description}</p>
                </div>
              </div>
            ))}

            {!isAdding && customSites.length === 0 && (
              <div className="col-span-full text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground">No custom heritage sites added yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SitesManager;
