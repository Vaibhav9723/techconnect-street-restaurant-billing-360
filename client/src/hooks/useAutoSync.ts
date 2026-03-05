import { useEffect, useRef } from "react";

export function useAutoSync<T>({
  enabled,
  data,
  onSync,
  delay = 1200,
}: {
  enabled: boolean;
  data: T;
  onSync: (data: T) => Promise<void>;
  delay?: number;
}) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      onSync(data).catch(() => {});
    }, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [enabled, data]);
}
