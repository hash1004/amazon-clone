import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12">
      <Link
        href="#top"
        className="block bg-chrome-belt-hover py-3 text-center text-sm text-white hover:bg-[#485769]"
      >
        Back to top
      </Link>
      <div className="bg-chrome-belt text-neutral-300">
        <div className="mx-auto grid max-w-[1000px] gap-8 px-6 py-10 text-sm sm:grid-cols-3">
          <div>
            <h3 className="mb-2 font-bold text-white">Get to Know Us</h3>
            <ul className="space-y-1">
              <li>About</li>
              <li>Careers</li>
              <li>Press Releases</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-white">Shopping</h3>
            <ul className="space-y-1">
              <li><Link href="/s" className="hover:underline">All products</Link></li>
              <li><Link href="/cart" className="hover:underline">Your cart</Link></li>
              <li><Link href="/account/orders" className="hover:underline">Your orders</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-white">About This Build</h3>
            <ul className="space-y-1">
              <li>Timed assignment</li>
              <li>Next.js · Prisma · Postgres</li>
              <li>Payments are mocked</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-chrome-nav py-6 text-center text-xs text-neutral-400">
        <p>
          <span className="text-lg font-bold text-white">amazon</span>
          <span className="text-accent-buy">.clone</span>
        </p>
        <p className="mt-2">
          Not affiliated with Amazon. Built as a portfolio / assignment project.
        </p>
      </div>
    </footer>
  );
}
