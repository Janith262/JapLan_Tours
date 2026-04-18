import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScheduledTour } from "@/hooks/useAdminData";

export const ScheduledTourModal = ({
  tour,
  isOpen,
  onClose,
}: {
  tour: ScheduledTour | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!tour) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">{tour.destinations} ({tour.durationDays})</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
           {/* Left Column: Itinerary */}
           <div className="space-y-6 pr-4 border-r border-border/50">
             {tour.days.map((day, idx) => (
                <div key={idx} className="space-y-2 pb-4">
                   <h4 className="font-bold">■ {day.title}</h4>
                   <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: day.desc }} />
                </div>
             ))}
           </div>
           
           {/* Right Column: Image Gallery */}
           <div className="space-y-6">
              {tour.gallery.map((img, idx) => (
                 <div key={idx} className="space-y-2">
                    <img src={img.imageUrl} alt={img.caption} className="w-full rounded-lg shadow-sm object-cover" />
                    {img.caption && <p className="text-xs font-medium text-center text-muted-foreground">{img.caption}</p>}
                 </div>
              ))}
           </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};
export default ScheduledTourModal;
