export function mergeById(local: any[], remote: any[]): any[] {
  const map = new Map<string, any>();

  // 1. Seed with local items (offline-first)
  for (const item of local) {
    map.set(item.id, item);
  }

  // 2. Merge remote — only overwrite local when remote is genuinely newer
  for (const r of remote) {
    const l = map.get(r.id);

    if (!l) {
      // Remote-only item — add it
      map.set(r.id, r);
      continue;
    }

    const lTime = l.updatedAt ?? 0;
    const rTime = r.updatedAt ?? 0;

    // Local is soft-deleted AND not older than remote
    // → Keep local deleted state (prevent resurrection)
    if (l.isDeleted && lTime >= rTime) {
      continue;
    }

    // Remote is soft-deleted AND not older than local
    // → Propagate deletion from remote
    if (r.isDeleted && rTime >= lTime) {
      map.set(r.id, r);
      continue;
    }

    // General rule: latest updatedAt wins (tie → keep local)
    if (rTime > lTime) {
      map.set(r.id, r);
    }
  }

  // 3. Stable sort by updatedAt (newest first)
  return Array.from(map.values()).sort(
    (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
  );
}