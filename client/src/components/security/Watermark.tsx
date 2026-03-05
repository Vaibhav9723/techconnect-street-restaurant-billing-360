import { useEffect, useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export default function Watermark() {
  const { user, role } = useFirebaseAuth();
  const [licenseId, setLicenseId] = useState("");

  useEffect(() => {
    try {
      const storedDays = localStorage.getItem("subscription_days_left");
      const license = import.meta.env.VITE_LICENSE_ID || "";
      setLicenseId(license);
    } catch {}
  }, []);

  if (!user) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 999999,
        pointerEvents: "none",
        opacity: 0.12,
        fontSize: "15px",
        fontWeight: "600",
        transform: "rotate(-10deg)",
        userSelect: "none",
      }}
    >
      <div style={{ textAlign: "right", lineHeight: "1.3" }}>
        <div>TechConnect POS</div>
        <div>Licensed To: {user.email}</div>
        <div>License ID: {licenseId}</div>
      </div>
    </div>
  );
}
