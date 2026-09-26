#!/usr/bin/env bash
# Reseeds the PRODUCTION catalog. Run this ON THE VPS, by hand, rarely.
#
# prisma/seed.ts deletes every Product, Cart, and Order row before
# inserting the fixed catalog — this is NOT part of the routine deploy
# script (deploy.sh) on purpose. Only run this when you actually mean to
# throw away the current catalog and every order/cart tied to it (e.g.
# the first load of a new catalog, like the Amazon-clone → Still Coffee
# Co. cutover). Requires amazon-clone-builder:latest to already be built
# (deploy.sh builds it as a side effect; run that first if this image is
# missing or stale).

set -euo pipefail

NETWORK="amazon-clone_default"
DATABASE_URL="postgresql://amazon:9QIOwVvv3Dkv9GbNvgNoVvcvLIPHgQos@db:5432/amazon_clone?schema=public"

echo "This will DELETE every Product, Cart, and Order in production and reseed"
echo "from prisma/seed.ts. This cannot be undone from here."
read -r -p "Type 'reseed' to continue: " confirm
if [ "$confirm" != "reseed" ]; then
  echo "Aborted."
  exit 1
fi

docker service create --name prisma-seed-tmp --network "$NETWORK" --restart-condition=none \
  -e DATABASE_URL="$DATABASE_URL" amazon-clone-builder:latest npx prisma db seed >/dev/null

state=""
while :; do
  state=$(docker service ps prisma-seed-tmp --no-trunc --format '{{.CurrentState}}' 2>/dev/null | head -1)
  case "$state" in
    Complete*) break ;;
    Failed*)
      echo "!! seed failed:"
      docker service logs prisma-seed-tmp 2>&1 || true
      docker service rm prisma-seed-tmp >/dev/null 2>&1 || true
      exit 1
      ;;
    *) sleep 2 ;;
  esac
done

docker service logs prisma-seed-tmp 2>&1
docker service rm prisma-seed-tmp >/dev/null
echo "Done."
