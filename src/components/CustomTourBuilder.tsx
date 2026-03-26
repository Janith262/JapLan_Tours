import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, CarFront, Bus, Hotel, Star, Home, Landmark, Trees, Waves, UtensilsCrossed, ChevronLeft, ChevronRight, Mail, MessageCircle, Calendar as CalendarIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/useLanguage";
import { translations } from "@/context/translations";
import tourBg from "@/assets/tour-builder-bg.jpg";

const CustomTourBuilder = () => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const vehicles = [
    { id: "sedan", label: t("vehicle.sedan"), sub: t("vehicle.sedan_sub"), icon: CarFront },
    { id: "van", label: t("vehicle.van"), sub: t("vehicle.van_sub"), icon: Bus },
    { id: "minibus", label: t("vehicle.minibus"), sub: t("vehicle.minibus_sub"), icon: Bus },
  ];

  const accommodations = [
    { id: "heritage", label: t("accommodation.heritage"), icon: Landmark, desc: t("accommodation.heritage_desc") },
    { id: "luxury", label: t("accommodation.luxury"), icon: Star, desc: t("accommodation.luxury_desc") },
    { id: "comfort", label: t("accommodation.comfort"), icon: Home, desc: t("accommodation.comfort_desc") },
  ];

  const interests = [
    { id: "history", label: t("interest.history"), icon: Landmark },
    { id: "wildlife", label: t("interest.wildlife"), icon: Trees },
    { id: "beach", label: t("interest.beach"), icon: Waves },
    { id: "culinary", label: t("interest.culinary"), icon: UtensilsCrossed },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const steps = [t("tour.duration"), t("tour.vehicle"), t("tour.stay"), t("tour.interests")];

  const canNext = () => {
    if (step === 0) return true;
    if (step === 1) return !!vehicle;
    if (step === 2) return !!accommodation;
    return true;
  };

  return (
    <section id="tour-builder" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-scroll md:bg-fixed" style={{ backgroundImage: `url(${tourBg})` }} />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-3">{t("tour.tagline")}</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">{t("tour.title")}</h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 glass-strong rounded-2xl p-8"
          >
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => setStep(i)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      i <= step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </button>
                  <span className="text-xs font-medium text-foreground hidden sm:block">{s}</span>
                  {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-accent" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
                className="will-change-transform"
              >
                {step === 0 && (
                  <div className="space-y-8 max-w-md mx-auto">
                    <div className="space-y-6">
                      <h3 className="font-serif text-2xl font-bold text-foreground text-center">{t("tour.how_many_days")}</h3>
                      <div className="py-4 px-2">
                        <Slider value={[days]} onValueChange={(v) => setDays(v[0])} min={2} max={21} step={1} className="w-full" />
                      </div>
                      <p className="text-center text-4xl font-serif font-bold text-accent">
                        {days} <span className="text-lg text-muted-foreground">{t("tour.days_unit")}</span>
                      </p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border/30">
                      <h3 className="font-serif text-2xl font-bold text-foreground text-center">{t("tour.start_date")}</h3>
                      <div className="flex justify-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full max-w-sm h-14 bg-card/50 border-2 border-border rounded-xl px-4 font-normal focus:outline-none focus:border-accent transition-colors hover:border-accent/50 hover:bg-card/80",
                                !startDate && "text-muted-foreground",
                                "flex justify-between items-center text-lg"
                              )}
                            >
                              {startDate ? (
                                format(new Date(startDate), "PPP", { locale: language === "ja" ? ja : undefined })
                              ) : (
                                <span>{language === "ja" ? "日付を選択" : "Select a date"}</span>
                              )}
                              <CalendarIcon className="h-5 w-5 opacity-50 text-accent" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[100]" align="center">
                            <Calendar
                              mode="single"
                              selected={startDate ? new Date(startDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  // Keep the date as local date string to prevent timezone shifts
                                  const year = date.getFullYear();
                                  const month = String(date.getMonth() + 1).padStart(2, '0');
                                  const day = String(date.getDate()).padStart(2, '0');
                                  setStartDate(`${year}-${month}-${day}`);
                                } else {
                                  setStartDate("");
                                }
                              }}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-2xl font-bold text-foreground">{t("tour.choose_vehicle")}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {vehicles.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setVehicle(v.id)}
                          className={`p-6 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                            vehicle === v.id ? "border-accent bg-accent/10 shadow-lg" : "border-border bg-card hover:border-accent/50"
                          }`}
                        >
                          <v.icon className={`mx-auto mb-3 ${vehicle === v.id ? "text-accent" : "text-muted-foreground"}`} size={32} />
                          <p className="font-semibold text-foreground">{v.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{v.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-2xl font-bold text-foreground">{t("tour.accommodation")}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {accommodations.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setAccommodation(a.id)}
                          className={`p-6 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                            accommodation === a.id ? "border-accent bg-accent/10 shadow-lg" : "border-border bg-card hover:border-accent/50"
                          }`}
                        >
                          <a.icon className={`mx-auto mb-3 ${accommodation === a.id ? "text-accent" : "text-muted-foreground"}`} size={32} />
                          <p className="font-semibold text-foreground">{a.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-2xl font-bold text-foreground">{t("tour.your_interests")}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {interests.map((int) => (
                        <label
                          key={int.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] select-none [-webkit-tap-highlight-color:transparent] ${
                            selectedInterests.includes(int.id) ? "border-accent bg-accent/10" : "border-border bg-card"
                          }`}
                        >
                          <Checkbox checked={selectedInterests.includes(int.id)} onCheckedChange={() => toggleInterest(int.id)} />
                          <int.icon className="text-accent" size={24} />
                          <span className="font-medium text-foreground">{int.label}</span>
                        </label>
                      ))}
                    </div>
                    {/* Send buttons for the final step */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                      <Button
                        onClick={() => {
                          const getEnLang = (key: keyof typeof translations.en) => translations.en[key] || (key as string);
                          const emailVehicleLabel = vehicle ? getEnLang(`vehicle.${vehicle}` as any) : "—";
                          const emailAccommodationLabel = accommodation ? getEnLang(`accommodation.${accommodation}` as any) : "—";
                          const interestsList = selectedInterests.length > 0 
                            ? selectedInterests.map((id) => getEnLang(`interest.${id}` as any)).join(", ") 
                            : getEnLang("itinerary.none_selected" as any);
                          const emailBody = encodeURIComponent(
                            `${getEnLang("email.greeting" as any)}\n\n${getEnLang("email.body_intro" as any)}\n\n` +
                            `${getEnLang("email.body_start_date" as any)} ${startDate || "—"}\n` +
                            `${getEnLang("email.body_duration" as any)} ${days} ${getEnLang("tour.days_unit" as any)}\n` +
                            `${getEnLang("email.body_vehicle" as any)} ${emailVehicleLabel}\n` +
                            `${getEnLang("email.body_accommodation" as any)} ${emailAccommodationLabel}\n` +
                            `${getEnLang("email.body_interests" as any)} ${interestsList}\n\n` +
                            `${getEnLang("email.body_request" as any)}\n\n` +
                            `${getEnLang("email.body_closing" as any)}`
                          );
                          window.location.href = `mailto:japlantours.srilanka@gmail.com?subject=${encodeURIComponent(getEnLang("email.subject" as any))}&body=${emailBody}`;
                        }}
                        className="bg-secondary hover:bg-secondary/90 text-white h-12 rounded-xl text-lg font-semibold flex-1 gap-2"
                      >
                        <Mail size={18} /> {t("button.send_mail")}
                      </Button>
                      <Button
                        onClick={() => window.open("https://line.me/ti/p/MatnhhMPdf", "_blank")}
                        className="bg-[#06C755] hover:bg-[#05b34c] text-white h-12 rounded-xl text-lg font-semibold flex-1 gap-2"
                      >
                        <MessageCircle size={18} /> {t("button.send_line")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Common Nav buttons inside motion.div */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-6 mt-12 pt-8 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition w-full sm:w-auto justify-center sm:justify-start py-2 font-medium select-none"
                  >
                    <ChevronLeft size={18} /> {t("button.back")}
                  </button>
                  {step < 3 && (
                    <Button
                      type="button"
                      onClick={() => setStep(Math.min(3, step + 1))}
                      disabled={!canNext()}
                      className="bg-accent text-accent-foreground hover:brightness-110 rounded-xl px-10 h-12 font-bold w-full sm:w-auto shadow-lg shadow-accent/20 select-none"
                    >
                      {t("button.next")} <ChevronRight size={18} className="ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Sticky Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:w-72 glass-strong rounded-2xl p-6 lg:sticky lg:top-24 h-fit"
          >
            <h4 className="font-serif text-lg font-bold text-foreground mb-4">{t("itinerary.title")}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground truncate">{t("tour.start_date").split('?')[0]}</span>
                <span className="font-semibold text-foreground whitespace-nowrap">{startDate || "—"}</span>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("tour.duration")}</span>
                <span className="font-semibold text-foreground">{days} {t("tour.days_unit")}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("tour.vehicle")}</span>
                <span className="font-semibold text-foreground">
                  {vehicle ? vehicles.find((v) => v.id === vehicle)?.label : "—"}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("tour.stay")}</span>
                <span className="font-semibold text-foreground">
                  {accommodation ? accommodations.find((a) => a.id === accommodation)?.label : "—"}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div>
                <span className="text-muted-foreground">{t("tour.interests")}</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedInterests.length > 0 ? (
                    selectedInterests.map((id) => (
                      <span key={id} className="bg-accent/20 text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                        {interests.find((i) => i.id === id)?.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">{t("itinerary.none_selected")}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CustomTourBuilder;
