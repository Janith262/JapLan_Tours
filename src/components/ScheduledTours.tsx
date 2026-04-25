import { useState } from "react";
import { useAdminData, ScheduledTour } from "@/hooks/useAdminData";
import { useLanguage } from "@/context/useLanguage";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import ScheduledTourModal from "./ScheduledTourModal";

const ScheduledTours = () => {
  const { scheduledTours, isLoadingScheduled } = useAdminData({ loadScheduled: true, loadReviews: false, loadSites: false });
  const [selectedTour, setSelectedTour] = useState<ScheduledTour | null>(null);
  const { language, t } = useLanguage();

  if (isLoadingScheduled || scheduledTours.length === 0) return null;

  return (
    <section className="py-20 bg-background" id="scheduled-tours">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">{t('navbar.plan_tour') || "Plan Your Tour"}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
             {language === 'ja' 
                ? "私たちが厳選した特別ツアーをご覧ください。すべての旅行プランは心を込めて作られています。"
                : "Explore our specially curated scheduled tours. All travel plans are crafted with heart."}
          </p>
          <p className="text-sm font-semibold text-accent">
            {language === 'ja' 
                ? "*すべての特別ツアーの料金はセダン車専用です。" 
                : "*All scheduled tour prices are for sedan car only."}
          </p>
        </div>

        <div className="space-y-12">
           {scheduledTours.map((tour) => {
              const displayDuration = language === 'ja' && tour.durationDaysJa ? tour.durationDaysJa : tour.durationDays;
              const displayDestinations = language === 'ja' && tour.destinationsJa ? tour.destinationsJa : tour.destinations;
              
              return (
                <div key={tour.id} className="relative w-full min-h-[400px] md:min-h-[500px] flex flex-col justify-center rounded-sm overflow-hidden group shadow-lg">
                   {/* Background Image */}
                   <img src={tour.heroImage} alt={displayDestinations} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   
                   {/* Dark Overlay */}
                   <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/50" />
                   
                   {/* Content Overlay */}
                   <div className="relative z-10 flex flex-col items-center justify-center text-white text-center p-6 sm:p-8 md:p-12 h-full w-full py-16 md:py-24">
                      <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-md leading-tight max-w-4xl">{displayDuration}</h3>
                      <p className="text-lg md:text-2xl font-medium mb-6 drop-shadow-md max-w-3xl leading-snug">{displayDestinations}</p>
                      {tour.priceYen && (
                        <p className="text-base sm:text-lg md:text-xl font-bold mb-8 text-green-400 drop-shadow-md">{tour.priceYen}</p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button 
                          className="bg-[#3FA162] hover:bg-[#348A52] text-white border-0 px-6 sm:px-8 py-6 text-sm sm:text-base md:text-lg rounded-sm shadow-md transition-all hover:scale-105 h-auto whitespace-normal"
                          onClick={() => setSelectedTour(tour)}
                        >
                          {language === 'ja' ? '詳細はこちらをクリック' : 'Click here for details'}
                        </Button>
                        
                        <Button 
                          className="bg-accent hover:bg-accent/90 text-accent-foreground border-0 px-6 sm:px-8 py-6 text-sm sm:text-base md:text-lg rounded-sm shadow-md transition-all hover:scale-105 gap-2 font-semibold h-auto whitespace-normal"
                          onClick={() => {
                            const subject = encodeURIComponent(`Booking Request: ${tour.durationDays} - ${tour.destinations}`);
                            const body = encodeURIComponent(
                              `Hello JapLan Tours,\n\n` +
                              `I would like to book the following scheduled tour package:\n\n` +
                              `Tour: ${tour.durationDays} (${tour.destinations})\n` +
                              `Price: ${tour.priceYen}\n\n` +
                              `--- Add Extra Details Below ---\n` +
                              `(If you want to request any changes to the package or add custom requirements, please type them here)\n\n\n\n\n` +
                              `Thank you!`
                            );
                            window.location.href = `mailto:japlantours.srilanka@gmail.com?subject=${subject}&body=${body}`;
                          }}
                        >
                          <Mail size={20} className="shrink-0" /> {language === 'ja' ? '今すぐ予約' : 'Book Now'}
                        </Button>
                      </div>
                   </div>
                </div>
              );
           })}
        </div>
      </div>

      <ScheduledTourModal 
        tour={selectedTour} 
        isOpen={selectedTour !== null} 
        onClose={() => setSelectedTour(null)} 
      />
    </section>
  );
};
export default ScheduledTours;
