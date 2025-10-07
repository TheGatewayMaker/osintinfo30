import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SAMPLE_LINES = [
  "Email: j***doe@example.com",
  "Password: ************",
  "Phone: +1 *** *** 1234",
  "IP: 192.***.***.45",
  "Username: a***_smith",
  "Card: **** **** **** 1234",
  "Address: 2** Baker St, L***",
  "SSN: ***-**-6789",
  "Token: sk-********************************",
  "DOB: **/**/1990",
];

function useCycler<T>(items: T[], intervalMs: number) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);
  return idx;
}

export default function MaskedInfoTicker({
  items,
  interval = 2200,
  className,
}: {
  items?: string[];
  interval?: number;
  className?: string;
}) {
  const list = useMemo(
    () => (items && items.length ? items : SAMPLE_LINES),
    [items],
  );
  const index = useCycler(list, interval);
  const lastIndex = useRef(index);
  const direction = useMemo(() => {
    const dir = Math.random() > 0.5 ? 1 : -1; // 1: left->right, -1: right->left
    lastIndex.current = index;
    return dir;
  }, [index]);

  return (
    <div
      className={
        "relative mx-auto max-w-xl overflow-hidden rounded-lg border border-border bg-card/70 px-4 py-3 shadow ring-1 ring-brand-500/10 backdrop-blur " +
        (className || "")
      }
      style={{ perspective: 800 }}
      aria-live="polite"
    >
      <div className="relative h-7 md:h-8">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={index}
            initial={{
              x: direction > 0 ? -40 : 40,
              opacity: 0,
              rotateY: direction > 0 ? 12 : -12,
            }}
            animate={{ x: 0, opacity: 1, rotateY: 0 }}
            exit={{
              x: direction > 0 ? 40 : -40,
              opacity: 0,
              rotateY: direction > 0 ? -12 : 12,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="absolute inset-0 flex items-center justify-center text-[13px] md:text-sm font-semibold tracking-wide text-brand-700 dark:text-brand-300"
          >
            <span className="[text-shadow:0_6px_16px_rgba(0,0,0,0.25)]">
              {list[index]}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
