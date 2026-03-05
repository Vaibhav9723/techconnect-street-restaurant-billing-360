import React, { useEffect, useState } from "react";

export function DevtoolsGuard({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let lastCheck = 0;

    const checkDevtools = () => {
      const now = Date.now();
      if (now - lastCheck < 1000) return; // 1 second me max 1 check
      lastCheck = now;

      const threshold = 160;

      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      const isOpen =
        widthDiff > threshold || heightDiff > threshold;

      if (isOpen) {
        setBlocked(true);
      }
    };

    const keyListener = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J"))
      ) {
        setBlocked(true);
      }
    };

    const interval = setInterval(checkDevtools, 1200);
    window.addEventListener("keydown", keyListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", keyListener);
    };
  }, []);

  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center space-y-4 p-6">
          <h1 className="text-xl font-bold">
            Developer Tools Detected
          </h1>
          <p className="text-sm text-gray-300">
            Security violation detected. Please close developer tools.
          </p>
          <p className="text-xs text-gray-400">
            Restart the POS after closing developer tools.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
