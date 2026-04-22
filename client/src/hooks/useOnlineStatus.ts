import { useEffect, useRef, useState } from "react";

export function useOnlineStatus(onReconnect?: () => void): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const wasOffline = useRef(!navigator.onLine);
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline.current && onReconnectRef.current) {
        console.log("🌐 Internet reconnected — triggering sync flush");
        wasOffline.current = false;
        onReconnectRef.current();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOffline.current = true;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}