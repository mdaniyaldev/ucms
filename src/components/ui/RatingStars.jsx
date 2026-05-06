import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * RatingStars — reusable star rating component.
 *
 * @param {number}   value      - Current rating (1–5)
 * @param {function} onChange   - Callback when a star is clicked (input mode)
 * @param {boolean}  readOnly  - If true, stars are non-interactive (display mode)
 * @param {string}   size      - "sm" | "md" | "lg"
 * @param {string}   className - Additional classes
 */
export default function RatingStars({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
  className,
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };
  const iconSize = sizeMap[size] || sizeMap.md;

  const stars = [1, 2, 3, 4, 5];
  const displayValue = hoverValue || value;

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => !readOnly && setHoverValue(0)}
    >
      {stars.map((star) => {
        const filled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            className={cn(
              "transition-colors duration-150 focus:outline-none",
              readOnly
                ? "cursor-default"
                : "cursor-pointer hover:scale-110 transition-transform"
            )}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                iconSize,
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-slate-300 dark:text-slate-600"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
