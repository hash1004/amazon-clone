import ShopLayout from "./(shop)/layout";
import { NotFoundContent } from "@/components/not-found-content";

// Unmatched URLs land here outside the (shop) route group, so wrap in the
// shop layout to get the same header and footer as every other page.
export default function NotFound() {
  return (
    <ShopLayout>
      <NotFoundContent />
    </ShopLayout>
  );
}
