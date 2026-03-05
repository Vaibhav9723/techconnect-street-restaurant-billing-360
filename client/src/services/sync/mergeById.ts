export function mergeById<T extends { id: string; updatedAt?: number }>(
  local: T[],
  remote: T[]
): T[] {
  const map = new Map<string, T>();

  // 1️⃣ Local first (offline-first)
  for (const item of local) {
    map.set(item.id, item);
  }

  // 2️⃣ Merge remote (online authoritative if newer)
  for (const r of remote) {
    const l = map.get(r.id);

    if (!l) {
      map.set(r.id, r);
      continue;
    }

    const lTime = l.updatedAt ?? 0;
    const rTime = r.updatedAt ?? 0;

    if (rTime > lTime) {
      map.set(r.id, r);
    }
  }

  // 3️⃣ Stable order (newest first if available)
  return Array.from(map.values()).sort(
    (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
  );
}
