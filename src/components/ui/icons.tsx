import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";

type P = { className?: string };

/**
 * Thin wrappers around lucide-react — one clean, consistent icon set
 * instead of hand-rolled one-off SVGs. Call sites are unchanged (same
 * names/props), only the implementation moved to a real icon library.
 */
export function SearchIcon({ className = "h-5 w-5" }: P) {
  return <Search className={className} strokeWidth={2} aria-hidden />;
}

export function CartIcon({ className = "h-5 w-5" }: P) {
  return <ShoppingCart className={className} strokeWidth={1.8} aria-hidden />;
}

export function CategoriesIcon({ className = "h-5 w-5" }: P) {
  return <Menu className={className} strokeWidth={2} aria-hidden />;
}

export function PersonIcon({ className = "h-5 w-5" }: P) {
  return <User className={className} strokeWidth={1.8} aria-hidden />;
}

export function ArrowLeftIcon({ className = "h-4 w-4" }: P) {
  return <ArrowLeft className={className} strokeWidth={2} aria-hidden />;
}

export function ArrowRightIcon({ className = "h-4 w-4" }: P) {
  return <ArrowRight className={className} strokeWidth={2} aria-hidden />;
}

export function CloseIcon({ className = "h-4 w-4" }: P) {
  return <X className={className} strokeWidth={2} aria-hidden />;
}

export function HeartIcon({
  className = "h-5 w-5",
  filled = false,
}: P & { filled?: boolean }) {
  return (
    <Heart
      className={className}
      strokeWidth={1.8}
      fill={filled ? "currentColor" : "none"}
      aria-hidden
    />
  );
}
