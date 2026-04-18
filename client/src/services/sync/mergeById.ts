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
export function mergeById<
  T extends {
    id: string;
    updatedAt?: number;
    isSynced?: boolean;
    isDeleted?: boolean;
  }
>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();

  // 1️⃣ Seed with local items (offline-first)
  for (const item of local) {
    map.set(item.id, item);
  }

  // 2️⃣ Merge remote — only overwrite local when remote is genuinely newer
  for (const r of remote) {
    const l = map.get(r.id);

    if (!l) {
      // Remote-only item — add it
      map.set(r.id, r);
      continue;
    }

    const lTime = l.updatedAt ?? 0;
    const rTime = r.updatedAt ?? 0;

    // 🔒 Local is soft-deleted AND not older than remote
    // → Keep local deleted state (prevent resurrection)
    if (l.isDeleted && lTime >= rTime) {
      continue;
    }

    // 🔒 Remote is soft-deleted AND not older than local
    // → Propagate deletion from remote
    if (r.isDeleted && rTime >= lTime) {
      map.set(r.id, r);
      continue;
    }

    // 🔒 Local is unsynced AND remote is same age or older
    // → Preserve unsynced local data (don't overwrite with stale remote)
    if (l.isSynced === false && rTime <= lTime) {
      continue;
    }

    // 🏆 General rule: latest updatedAt wins
    if (rTime > lTime) {
      map.set(r.id, r);
    }
  }

  // 3️⃣ Stable sort by updatedAt (newest first)
  return Array.from(map.values()).sort(
    (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
  );
}
