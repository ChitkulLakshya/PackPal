import { motion } from "framer-motion";
import { Check, GripVertical } from "lucide-react";
import { PackingItem as PackingItemType } from "@/utils/packingListGenerator";
import { cn } from "@/lib/utils";

interface PackingItemProps {
  item: PackingItemType;
  onToggle: (id: string) => void;
}

const PackingItem = ({ item, onToggle }: PackingItemProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group",
        item.packed
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border hover:border-primary/40"
      )}
      onClick={() => onToggle(item.id)}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
          item.packed
            ? "bg-primary border-primary"
            : "border-muted-foreground/30 group-hover:border-primary/50"
        )}
      >
        {item.packed && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>

      <span
        className={cn(
          "flex-1 text-sm transition-all",
          item.packed && "line-through text-muted-foreground"
        )}
      >
        {item.name}
        {item.essential && (
          <span className="ml-2 text-xs text-accent font-semibold">Essential</span>
        )}
      </span>
    </motion.div>
  );
};

export default PackingItem;
