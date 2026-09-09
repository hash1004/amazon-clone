import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";

type Tile = { image: string; caption?: string; href: string };

export type PosterCardData =
  | { kind: "quad"; title: string; footerHref: string; footerLabel: string; tiles: Tile[] }
  | { kind: "single"; title: string; footerHref: string; footerLabel: string; tile: Tile }
  | {
      kind: "split";
      title: string;
      footerHref: string;
      footerLabel: string;
      lead: Tile;
      tiles: Tile[];
    };

export function PosterCard({ data }: { data: PosterCardData }) {
  return (
    <div className="flex flex-col bg-surface p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold leading-snug">{data.title}</h2>

      <div className="flex-1">
        {data.kind === "quad" && (
          <div className="grid grid-cols-2 gap-3">
            {data.tiles.slice(0, 4).map((t, i) => (
              <TileLink key={i} tile={t} />
            ))}
          </div>
        )}

        {data.kind === "single" && (
          <Link href={data.tile.href} className="block">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border-default bg-white">
              <Image
                src={data.tile.image}
                alt={data.tile.caption ?? data.title}
                fill
                sizes="(max-width:1024px) 45vw, 320px"
                className="object-contain p-2"
              />
            </div>
          </Link>
        )}

        {data.kind === "split" && (
          <div>
            <Link href={data.lead.href} className="block">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md border border-border-default bg-white">
                <Image
                  src={data.lead.image}
                  alt={data.lead.caption ?? data.title}
                  fill
                  sizes="(max-width:1024px) 45vw, 320px"
                  className="object-contain p-2"
                />
              </div>
              {data.lead.caption && (
                <p className="mt-1 text-xs text-text-primary">
                  {data.lead.caption}
                </p>
              )}
            </Link>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {data.tiles.slice(0, 3).map((t, i) => (
                <TileLink key={i} tile={t} compact />
              ))}
            </div>
          </div>
        )}
      </div>

      <Link
        href={data.footerHref}
        className="link mt-3 inline-block text-sm"
      >
        {data.footerLabel}
      </Link>
    </div>
  );
}

function TileLink({ tile, compact }: { tile: Tile; compact?: boolean }) {
  return (
    <Link href={tile.href} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border-default bg-white">
        <Image
          src={tile.image}
          alt={tile.caption ?? ""}
          fill
          sizes="180px"
          className="object-contain p-2 transition-transform group-hover:scale-105"
        />
      </div>
      {tile.caption && (
        <p
          className={`mt-1 line-clamp-1 text-text-primary group-hover:text-text-accent ${
            compact ? "text-[0.7rem]" : "text-xs"
          }`}
        >
          {tile.caption}
        </p>
      )}
    </Link>
  );
}
