"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  UserPen,
  HardDrive,
  Info,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Phone,
  MessageCircle,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { db } from "@/lib/db/database";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function SettingsPage() {
  const [storageUsage, setStorageUsage] = useState<string>("Calculating...");
  const [storageQuota, setStorageQuota] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    async function estimateStorage() {
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageUsage(formatBytes(estimate.usage ?? 0));
          setStorageQuota(formatBytes(estimate.quota ?? 0));
        } catch {
          setStorageUsage("Unable to estimate");
        }
      } else {
        setStorageUsage("Not available");
      }
    }
    estimateStorage();
  }, []);

  const handleClearData = useCallback(async () => {
    setClearing(true);
    try {
      await db.delete();
      await db.open();
      setConfirmOpen(false);
      toast.success("All data cleared");
      window.location.href = "/";
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to clear data";
      toast.error(msg);
    } finally {
      setClearing(false);
    }
  }, []);

  return (
    <main className="flex flex-1 flex-col pb-20">
      <PageHeader title="Settings" />

      <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="py-1">
            <Link
              href="/profile"
              className="flex items-center gap-3 py-3 transition-colors"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-teal-50">
                <UserPen className="size-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Edit Profile</p>
                <p className="text-xs text-muted-foreground">
                  Update your personal information
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="size-4 text-teal-600" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Used</span>
                <span className="text-sm font-medium">{storageUsage}</span>
              </div>
              {storageQuota && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="text-sm font-medium">{storageQuota}</span>
                </div>
              )}
            </div>
            <Separator className="my-3" />
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">Important Notice</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                All data is stored locally on this device. Your entries, photos, and profile are saved in your browser&apos;s storage and are not uploaded to any server.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-700">
                Clearing your browser cache, site data, or cookies will <span className="font-semibold">permanently delete all your records</span>. We recommend using the <span className="font-semibold">Download Backup</span> feature in the Export tab regularly to keep a copy of your data.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-4 text-teal-600" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">App</span>
                <span className="text-sm font-medium">DietTracker</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Clinic</span>
                <span className="text-sm font-medium">All Derma Medical Clinic</span>
              </div>
              <Separator className="my-3" />
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
              <div className="space-y-2">
                <a href="tel:+6562380979" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-teal-600">
                  <Phone className="size-3.5" />
                  +65 6238 0979
                </a>
                <a href="https://wa.me/6598364006" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-teal-600">
                  <MessageCircle className="size-3.5" />
                  +65 9836 4006 (WhatsApp)
                </a>
                <a href="https://www.instagram.com/alldermaofficial/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-teal-600">
                  <Globe className="size-3.5" />
                  @alldermaofficial
                </a>
                <a href="https://www.facebook.com/alldermamedicalclinic" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-teal-600">
                  <Globe className="size-3.5" />
                  Facebook
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card className="border-0 shadow-sm">
          <CardContent className="py-3">
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger
                render={
                  <button className="flex w-full items-center gap-3 py-2 text-left transition-colors" />
                }
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-red-50">
                  <Trash2 className="size-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-600">Clear All Data</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete all entries and profile
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-red-500" />
                    Clear All Data
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. All your entries, profile data,
                    and photos will be permanently deleted from this device.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleClearData}
                    disabled={clearing}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {clearing ? "Clearing..." : "Yes, Delete Everything"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Created by{" "}
          <a
            href="https://ivanthan.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-teal-600"
          >
            IvanThan
          </a>
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
