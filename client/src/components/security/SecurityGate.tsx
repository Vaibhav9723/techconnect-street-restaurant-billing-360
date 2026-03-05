import React from "react";

const allowedHosts = (import.meta.env.VITE_ALLOWED_HOSTS || "")
  .split(",")
  .map((h: string) => h.trim())   // <-- Type added here
  .filter((v: string) => Boolean(v)); // <-- Type added here too

export function SecurityGate({ children }: { children: React.ReactNode }) {
  if (!allowedHosts.length) return <>{children}</>;

  const host: string = window.location.host;
  const isAllowed: boolean = allowedHosts.includes(host);

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full text-center space-y-4 p-6 border rounded-lg shadow-sm">
          <h1 className="text-xl font-bold text-red-600">
            Unauthorized Deployment
          </h1>
          <p className="text-sm text-muted-foreground">
            This POS application is not licensed for this domain:
          </p>
          <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
            {host}
          </p>
          <p className="text-xs text-muted-foreground">
            Please contact TechConnect360Degree support for a valid license.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
