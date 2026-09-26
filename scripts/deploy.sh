#!/usr/bin/env bash
# Manual deploy — run this ON THE VPS (ssh contabo, then from
# /root/amazon-clone) to pull the latest GitHub main and ship it.
#
# If you've set up `git push production main` (see README "Deploying"),
# you don't need this — the push itself triggers scripts/release.sh via
# the post-receive hook. This script is for deploying from GitHub main
# directly instead, without a separate push.

set -euo pipefail

REPO_DIR="/root/amazon-clone"

cd "$REPO_DIR"
printf '\n==> Pulling latest main\n'
git fetch origin
git checkout main
git reset --hard origin/main

exec "$REPO_DIR/scripts/release.sh"
