import { useEffect } from "react";

export default function AntiDebug() {
  useEffect(() => {
    // Disable right-click
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Disable common shortcut keys
    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    document.addEventListener("keydown", blockKeys);

    // DevTools Detection (Super Strong)
    let lastCheck = 0;
    const detectDevTools = () => {
      const threshold = 160;

      const start = performance.now();
      debugger;
      const end = performance.now();

      if (end - start > threshold) {
        document.body.innerHTML =
          "<h2 style='text-align:center;margin-top:50px;color:red'>Security Violation Detected</h2>";

        localStorage.clear(); // wipe data
        window.location.reload();
      }

      lastCheck = setTimeout(detectDevTools, 2000);
    };

    detectDevTools();

    return () => clearTimeout(lastCheck);
  }, []);

  return null;
}
