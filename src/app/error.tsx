"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw, FileDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadJson } from "@/lib/backup/export-json";
import { getFailureLog } from "@/lib/diagnostics/failure-log";

export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  const handleDiagnostics = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      errorMessage: error.message,
      errorStack: error.stack ?? null,
      failureLog: getFailureLog(),
    };
    downloadJson(
      JSON.stringify(payload, null, 2),
      "diettracker-diagnostics.json"
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle className="size-10 text-amber-500" />
      <h1 className="text-lg font-semibold">We couldn&apos;t open your records</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Your data is most likely still on this device. Please don&apos;t clear
        the app&apos;s data or reinstall — try again first.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button
          onClick={reset}
          className="h-11 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
        >
          <RotateCw className="size-4" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={handleDiagnostics}
          className="h-11 rounded-xl"
        >
          <FileDown className="size-4" />
          Download Diagnostics
        </Button>
        <a
          href="tel:+6562380979"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-teal-600"
        >
          <Phone className="size-4" />
          Call the clinic
        </a>
      </div>
    </div>
  );
}
