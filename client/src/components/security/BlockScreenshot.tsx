import { useEffect } from "react";

export default function BlockScreenshot() {
  useEffect(() => {
    // Block Print Screen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("");
        alert("⚠ Screenshot is disabled for security reasons.");
      }

      // Block Windows + Shift + S (Snipping tool)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        alert("⚠ Screenshot is disabled.");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Block copy screen via clipboard event
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      navigator.clipboard.writeText("Screenshot blocked.");
    };

    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  return null;
}
