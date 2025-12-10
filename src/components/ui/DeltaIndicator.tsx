import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Triangle03Icon } from "@hugeicons/core-free-icons";

interface DeltaIndicatorProps {
  show: boolean;
  size?: number;
}

export function DeltaIndicator({ show, size = 10 }: DeltaIndicatorProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, y: 8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, rotate: 24, scale: 0.85 }}
          className="inline-flex items-center"
        >
          <HugeiconsIcon
            icon={Triangle03Icon}
            size={size}
            className="text-primary"
          />
        </motion.span>
      )}
    </AnimatePresence>
  );
}
