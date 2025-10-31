import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { PackingCategory as PackingCategoryType } from "@/utils/packingListGenerator";
import PackingItem from "./PackingItem";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PackingCategoryProps {
  category: PackingCategoryType;
  onToggleItem: (itemId: string) => void;
}

const PackingCategory = ({ category, onToggleItem }: PackingCategoryProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const packedCount = category.items.filter(item => item.packed).length;
  const totalCount = category.items.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border shadow-md overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div className="text-left">
            <h3 className="font-semibold text-lg">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {packedCount} of {totalCount} packed
            </p>
          </div>
        </div>
        
        <ChevronDown
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {isOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          className="p-5 space-y-2"
        >
          {category.items.map((item) => (
            <PackingItem
              key={item.id}
              item={item}
              onToggle={onToggleItem}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PackingCategory;
