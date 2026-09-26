#!/usr/bin/env bash
# Routine deploy — run this ON THE VPS (ssh contabo, then run it from
# /root/amazon-clone). Pulls main, rebuilds the image, syncs the schema,
# and rolls the live service to the new image.
#
# Deliberately does NOT reseed the catalog — prisma/seed.ts wipes
# Product/Cart/Order on every run, which would destroy real orders placed
# between deploys. Use seed-prod.sh for that, separately and rarely.
#
# Schema sync is safe by default: `prisma db push` (no --accept-data-loss)
# refuses and exits non-zero on any destructive change instead of quietly
# dropping data — if that happens, stop and handle it by hand rather than
# re-running with a data-loss flag.

set -euo pipefail

REPO_DIR="/root/amazon-clone"
NETWORK="amazon-clone_default"
DATABASE_URL="postgresql://amazon:9QIOwVvv3Dkv9GbNvgNoVvcvLIPHgQos@db:5432/amazon_clone?schema=public"

log() { printf '\n==> %s\n' "$1"; }

# Runs one-shot `docker run`-style jobs as a temporary Swarm service, since
# amazon-clone_default is a Swarm overlay network and not plain-`docker
# run`-attachable. Waits for the task to finish, streams its logs, then
# tears the service down either way.
run_oneoff() {
  local name="$1"
  shift
  docker service create --name "$name" --network "$NETWORK" --restart-condition=none \
    -e DATABASE_URL="$DATABASE_URL" amazon-clone-builder:latest "$@" >/dev/null

  local state
  while :; do
    state=$(docker service ps "$name" --no-trunc --format '{{.CurrentState}}' 2>/dev/null | head -1)
    case "$state" in
      Complete*) break ;;
      Failed*)
        echo "!! $name failed:"
        docker service logs "$name" 2>&1 || true
        docker service rm "$name" >/dev/null 2>&1 || true
        exit 1
        ;;
      *) sleep 2 ;;
    esac
  done

  docker service logs "$name" 2>&1
  docker service rm "$name" >/dev/null
}

log "Pulling latest main"
cd "$REPO_DIR"
git fetch origin
git checkout main
git reset --hard origin/main
git log --oneline -1

log "Building runtime image (amazon-clone:latest)"
docker build -t amazon-clone:latest .

log "Building builder image (amazon-clone-builder:latest, for the migration step)"
docker build --target builder -t amazon-clone-builder:latest .

log "Syncing schema (fails loudly instead of dropping data — see header comment)"
run_oneoff prisma-migrate-tmp npx prisma db push

log "Rolling amazon-clone_web to the new image"
docker service update --image amazon-clone:latest --force amazon-clone_web

log "Done — https://amazon.svdistributor.com"
