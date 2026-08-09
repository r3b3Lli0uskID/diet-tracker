"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { logFailure } from "@/lib/diagnostics/failure-log";

const DISMISS_KEY = "dt-storage-banner-dismissed";
const OUTCOME_KEY = "dt-storage-persisted";

// Only one home-page banner should show at a time — the storage-denied
// warning takes priority over the backup-nudge banner (see BackupNudgeBanner).
export function isStorageBannerShowing(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(OUTCOME_KEY) === "denied" &&
    localStorage.getItem(DISMISS_KEY) !== "1"
  );
}

function getAddToHomeScreenCopy(): string {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  if (isIOS) {
    return "Add DietTracker to your Home Screen (Share → Add to Home Screen)";
  }
  if (/Android/.test(ua)) {
    return "Add DietTracker to your Home Screen (menu → Add to Home Screen / Install app)";
  }
  return "Install DietTracker as an app (browser menu → Add to Home Screen / Install)";
}

export function StorageGuardian() {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);
  const [addToHomeScreenCopy, setAddToHomeScreenCopy] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function requestPersistence() {
      if (!navigator.storage?.persist || !navigator.storage?.persisted) {
        localStorage.setItem(OUTCOME_KEY, "unsupported");
        return;
      }
      try {
        let granted = await navigator.storage.persisted();
        if (!granted) {
          granted = await navigator.storage.persist();
        }
        if (cancelled) return;
        localStorage.setItem(OUTCOME_KEY, granted ? "granted" : "denied");
        if (!granted && localStorage.getItem(DISMISS_KEY) !== "1") {
          setAddToHomeScreenCopy(getAddToHomeScreenCopy());
          setShowBanner(true);
        }
      } catch (err) {
        logFailure("storage.persist", err);
      }
    }

    requestPersistence();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShowBanner(false);
  };

  // Persist() is heuristic and mostly meaningful for the home-screen-installed
  // case; only surface guidance on the home page, and only once per dismissal.
  if (!showBanner || pathname !== "/") return null;

  return (
    <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-800">
      <div className="flex-1 text-xs leading-relaxed">
        <p className="font-semibold">Keep your records safe</p>
        <p className="mt-1">
          {addToHomeScreenCopy} and download a backup regularly from the
          Export tab — this protects your data if the browser ever clears its
          storage.
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-amber-600 hover:bg-amber-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
