#!/usr/bin/env bash
# Adds the sample written reviews (prisma/sample-reviews.ts) to the LIVE
# catalog. Run ON THE VPS (ssh contabo, from /root/amazon-clone), after a
# deploy has built amazon-clone-builder:latest with the Review table.
#
# Insert-only, unlike seed-prod.sh: nothing is deleted, and any coffee that
# already has reviews (sample or real) is skipped, so re-running is a no-op.
# The database URL is read from the running web service, not stored here.

set -euo pipefail

NETWORK="amazon-clone_default"
DATABASE_URL=$(docker service inspect amazon-clone_web \
  --format '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' \
  | sed -n 's/^DATABASE_URL=//p' | head -1)
if [ -z "$DATABASE_URL" ]; then
  echo "!! couldn't read DATABASE_URL from the amazon-clone_web service" >&2
  exit 1
fi

docker service create --name prisma-reviews-tmp --network "$NETWORK" --restart-condition=none \
  -e DATABASE_URL="$DATABASE_URL" amazon-clone-builder:latest npx tsx prisma/seed-reviews.ts >/dev/null

while :; do
  state=$(docker service ps prisma-reviews-tmp --no-trunc --format '{{.CurrentState}}' 2>/dev/null | head -1)
  case "$state" in
    Complete*) break ;;
    Failed*)
      echo "!! seeding reviews failed:"
      docker service logs prisma-reviews-tmp 2>&1 || true
      docker service rm prisma-reviews-tmp >/dev/null 2>&1 || true
      exit 1
      ;;
    *) sleep 2 ;;
  esac
done

docker service logs prisma-reviews-tmp 2>&1
docker service rm prisma-reviews-tmp >/dev/null
echo "Done."
