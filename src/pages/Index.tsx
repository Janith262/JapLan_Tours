import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HistorySection from "@/components/HistorySection";
import CustomTourBuilder from "@/components/CustomTourBuilder";
import Testimonials from "@/components/Testimonials";
import OrganizerSection from "@/components/OrganizerSection";
import Footer from "@/components/Footer";
import FloatingLine from "@/components/FloatingLine";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HistorySection />
      <CustomTourBuilder />
      <Testimonials />
      <OrganizerSection />
      <Footer />
      <FloatingLine />
    </div>
  );
};

export default Index;
