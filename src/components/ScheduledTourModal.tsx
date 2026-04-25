import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScheduledTour } from "@/hooks/useAdminData";
import { useLanguage } from "@/context/useLanguage";

export const ScheduledTourModal = ({
  tour,
  isOpen,
  onClose,
}: {
  tour: ScheduledTour | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { language } = useLanguage();

  if (!tour) return null;

  const displayDestinations = language === 'ja' && tour.destinationsJa ? tour.destinationsJa : tour.destinations;
  const displayDuration = language === 'ja' && tour.durationDaysJa ? tour.durationDaysJa : tour.durationDays;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">{displayDestinations} ({displayDuration})</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
           {/* Left Column: Itinerary */}
           <div className="space-y-6 pr-4 border-r border-border/50">
             {tour.days.map((day, idx) => {
                const dayTitle = language === 'ja' && day.titleJa ? day.titleJa : day.title;
                const dayDesc = language === 'ja' && day.descJa ? day.descJa : day.desc;
                return (
                  <div key={idx} className="space-y-2 pb-4">
                     <h4 className="font-bold">■ {dayTitle}</h4>
                     <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: dayDesc }} />
                  </div>
                );
             })}
           </div>
           
           {/* Right Column: Image Gallery */}
           <div className="space-y-6">
              {tour.gallery.map((img, idx) => {
                 const caption = language === 'ja' && img.captionJa ? img.captionJa : img.caption;
                 return (
                   <div key={idx} className="space-y-2">
                      <img src={img.imageUrl} alt={caption} className="w-full rounded-lg shadow-sm object-cover" />
                      {caption && <p className="text-xs font-medium text-center text-muted-foreground">{caption}</p>}
                   </div>
                 );
              })}
           </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};
export default ScheduledTourModal;
