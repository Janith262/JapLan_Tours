import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/useLanguage";

const FloatingLine = () => {
  const { t } = useLanguage();

  return (
    <motion.a
      href="https://line.me/R/ti/p/%2B94764345711"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.5, type: "spring" }}
      className="fixed bottom-6 right-6 z-50 bg-[#06C755] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
      aria-label={t("floating_line.label")}
      title={t("floating_line.label")}
    >
      <MessageCircle size={26} />
    </motion.a>
  );
};

export default FloatingLine;
