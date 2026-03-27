"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  FileDown,
  Upload,
  FileJson,
  FileText,
  Calendar,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { useEntries } from "@/hooks/useEntries";
import { useProfile } from "@/hooks/useProfile";
import { exportAllData, downloadJson } from "@/lib/backup/export-json";
import { importFromJson } from "@/lib/backup/import-json";
import { generateDietPdf } from "@/lib/pdf/generate-pdf";

function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    start: `${y}-${m}-01`,
    end: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
  };
}

export default function ExportPage() {
  const defaultRange = getCurrentMonthRange();
  const [fromDate, setFromDate] = useState(defaultRange.start);
  const [toDate, setToDate] = useState(defaultRange.end);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const { entries } = useEntries(fromDate, toDate);
  const { profile } = useProfile();

  const handleExportBackup = useCallback(async () => {
    setExporting(true);
    try {
      const json = await exportAllData();
      const timestamp = new Date().toISOString().split("T")[0];
      downloadJson(json, `diettracker-backup-${timestamp}.json`);
      toast.success("Backup downloaded successfully");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Export failed";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  }, []);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImporting(true);
      try {
        const text = await file.text();
        const count = await importFromJson(text);
        toast.success(`Restored ${count} entries successfully`);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Import failed";
        toast.error(msg);
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    []
  );

  const handleGeneratePdf = useCallback(() => {
    if (entries.length === 0) {
      toast.error("No entries in the selected date range");
      return;
    }

    setGeneratingPdf(true);
    try {
      generateDietPdf({
        profile: profile ?? null,
        entries,
        fromDate,
        toDate,
      });
      toast.success("PDF downloaded successfully");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "PDF generation failed";
      toast.error(msg);
    } finally {
      setGeneratingPdf(false);
    }
  }, [entries, profile, fromDate, toDate]);

  return (
    <main className="flex flex-1 flex-col pb-20">
      <PageHeader title="Export & Backup" subtitle="Manage your data" />

      <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4 text-teal-600" />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="from" className="text-xs">From</Label>
                <Input
                  id="from"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to" className="text-xs">To</Label>
                <Input
                  id="to"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <Database className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {entries.length} {entries.length === 1 ? "entry" : "entries"} in range
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-teal-600" />
              Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-3 rounded-xl"
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-50">
                <FileText className="size-4 text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {generatingPdf ? "Generating..." : "Generate PDF"}
                </p>
                <p className="text-xs text-muted-foreground">
                  A4 landscape diet tracking sheet
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileJson className="size-4 text-teal-600" />
              Backup & Restore
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-3 rounded-xl"
              onClick={handleExportBackup}
              disabled={exporting}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50">
                <FileDown className="size-4 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {exporting ? "Exporting..." : "Download Backup"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Export all data as JSON
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-12 w-full justify-start gap-3 rounded-xl"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-green-50">
                <Upload className="size-4 text-green-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {importing ? "Restoring..." : "Restore from Backup"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Import data from JSON file
                </p>
              </div>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </main>
  );
}
