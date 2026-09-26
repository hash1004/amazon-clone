#!/usr/bin/env bash
# Sets the deliberately low stock levels from prisma/seed.ts on the LIVE
# catalog, in place. Run ON THE VPS (ssh contabo, from /root/amazon-clone).
#
# Unlike seed-prod.sh this touches nothing but these four products' stock —
# no products, carts or orders are deleted. Safe to re-run; each run resets
# these four back to the numbers below (e.g. to demo "Only 3 left" again
# after test orders have sold some).

set -euo pipefail

DB_CONTAINER=$(docker ps -q -f name=amazon-clone_db | head -1)
if [ -z "$DB_CONTAINER" ]; then
  echo "!! amazon-clone_db container not found on this host" >&2
  exit 1
fi

docker exec -i "$DB_CONTAINER" psql -U amazon -d amazon_clone -v ON_ERROR_STOP=1 <<'SQL'
UPDATE "Product" SET stock = 3 WHERE title = 'Kenya Nyeri AA';
UPDATE "Product" SET stock = 5 WHERE title = 'Ethiopia Guji Natural';
UPDATE "Product" SET stock = 6 WHERE title = 'Sumatra Mandheling';
UPDATE "Product" SET stock = 8 WHERE title = 'Costa Rica Tarrazú';
SELECT title, stock FROM "Product" ORDER BY stock, title;
SQL
