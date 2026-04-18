// export function mergeById<T extends { id: string; updatedAt?: number }>(
//   local: T[],
//   remote: T[]
// ): T[] {
//   const map = new Map<string, T>();

//   // 1️⃣ Local first (offline-first)
//   for (const item of local) {
//     map.set(item.id, item);
//   }

//   // 2️⃣ Merge remote (online authoritative if newer)
//   for (const r of remote) {
//     const l = map.get(r.id);

//     if (!l) {
//       map.set(r.id, r);
//       continue;
//     }

//     const lTime = l.updatedAt ?? 0;
//     const rTime = r.updatedAt ?? 0;

//     if (rTime > lTime) {
//       map.set(r.id, r);
//     }
//   }

//   // 3️⃣ Stable order (newest first if available)
//   return Array.from(map.values()).sort(
//     (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
//   );
// }

// client/src/services/sync/mergeById.ts

// ─── FILE: client/src/services/sync/mergeById.ts ───────────────────


export function mergeById<
  T extends {
    id: string;
    updatedAt?: number;
    isDeleted?: boolean;
  }
>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();

  // 1. Seed with local items (offline-first)
  for (const item of local) {
    map.set(item.id, item);
  }

  // 2. Merge remote — only overwrite local when remote is genuinely newer
  for (const r of remote) {
    const l = map.get(r.id);

    if (!l) {
      // Remote-only item → add
      map.set(r.id, r);
      continue;
    }

    const lTime = l.updatedAt ?? 0;
    const rTime = r.updatedAt ?? 0;

    // Anti-resurrection: local is soft-deleted AND not older than remote
    // → Keep local deleted state (prevents deleted items from reappearing)
    if (l.isDeleted && lTime >= rTime) {
      continue;
    }

    // Propagate deletion: remote is soft-deleted AND not older than local
    // → Accept remote deletion
    if (r.isDeleted && rTime >= lTime) {
      map.set(r.id, r);
      continue;
    }

    // General rule: latest updatedAt wins
    // On tie (lTime === rTime) → keep local (offline-first)
    if (rTime > lTime) {
      map.set(r.id, r);
    }
  }

  // 3. Stable sort by updatedAt (newest first)
  return Array.from(map.values()).sort(
    (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
  );
}
