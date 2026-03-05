import { useEffect } from "react";

export default function AntiTamper() {

  // 🟡 Disable Anti-Tamper in Development because Vite / React modifies DOM
  if (import.meta.env.DEV) {
    console.warn("Anti-Tamper disabled in DEV mode");
    return null;
  }

  useEffect(() => {
    // ============= 1) Protect console override =================
    const originalConsole = { ...console };
    const protectConsole = () => {
      for (const key in console) {
        // @ts-ignore
        console[key] = originalConsole[key];
      }
    };
    setInterval(protectConsole, 500);

    // ============= 2) DevTools detection =======================
    let last = performance.now();
    setInterval(() => {
      const now = performance.now();
      if (now - last > 200) {
        triggerTamper("Devtools detected");
      }
      last = now;
    }, 100);

    // ============= 3) Script integrity check ===================
    const importantSelectors = [
      'script[src*="index"]',
      'script[src*="assets"]',
    ];

    setTimeout(() => {
      importantSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          const src = (el as HTMLScriptElement).src;
          if (!src.includes("assets")) {
            triggerTamper("Modified script detected");
          }
        });
      });
    }, 2000);

    // ============= 4) DOM injection detection ==================
    const observer = new MutationObserver(() => {
      if (document.body.innerHTML.includes("debug") ||
          document.body.innerHTML.includes("eval")) {
        triggerTamper("Suspicious DOM modification detected");
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function triggerTamper(message: string) {
      console.clear();
      sessionStorage.clear();

      document.body.innerHTML = `
        <div style="padding:60px;text-align:center;font-family:sans-serif;">
          <h1 style="color:red;">Security Alert</h1>
          <p>${message}</p>
          <p>Application locked due to tampering attempt.</p>
        </div>
      `;

      throw new Error("Anti-Tamper Triggered: " + message);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
