#!/usr/bin/env bash
# Builds + syncs schema + rolls the live service, assuming the working
# tree at $REPO_DIR is ALREADY checked out at the commit you want live.
# Two callers:
#   - deploy.sh (manual: fetches origin/main first, then calls this)
#   - .git/hooks/post-receive (git push-to-deploy: the push itself already
#     updated the working tree via `receive.denyCurrentBranch
#     updateInstead`, so this runs directly against what was just pushed)
#
# Deliberately does NOT reseed the catalog — see seed-prod.sh.

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

cd "$REPO_DIR"
log "Deploying $(git log --oneline -1)"

log "Building runtime image (amazon-clone:latest)"
docker build -t amazon-clone:latest .

log "Building builder image (amazon-clone-builder:latest, for the migration step)"
docker build --target builder -t amazon-clone-builder:latest .

log "Syncing schema (fails loudly instead of dropping data — see seed-prod.sh for reseeding)"
run_oneoff prisma-migrate-tmp npx prisma db push

log "Rolling amazon-clone_web to the new image"
docker service update --image amazon-clone:latest --force amazon-clone_web

log "Done — https://amazon.svdistributor.com"
