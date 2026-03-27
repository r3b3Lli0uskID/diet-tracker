"use client";

import { useState, useCallback, useRef, useEffect, use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Coffee,
  Sun,
  Moon,
  ChevronDown,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { useEntry } from "@/hooks/useEntry";
import { formatDate } from "@/lib/utils/date";
import { compressImage, generateThumbnail } from "@/lib/photo/compress";
import { cn } from "@/lib/utils";
import type { DailyEntry, MealEntry } from "@/lib/db/types";

function getPrevDate(date: string): string {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getNextDate(date: string): string {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface MealSectionProps {
  readonly title: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly meal: MealEntry;
  readonly onUpdate: (meal: MealEntry) => void;
}

function MealSection({ title, icon: Icon, meal, onUpdate }: MealSectionProps) {
  const [expanded, setExpanded] = useState(!meal.isNil);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (meal.photoThumbnail) {
      const url = URL.createObjectURL(meal.photoThumbnail);
      setThumbnailUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setThumbnailUrl(null);
  }, [meal.photoThumbnail]);

  const handleNilToggle = useCallback(
    (checked: boolean) => {
      onUpdate({ ...meal, isNil: checked });
      setExpanded(!checked);
    },
    [meal, onUpdate]
  );

  const handlePhotoCapture = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const [compressed, thumbnail] = await Promise.all([
          compressImage(file, 600, 0.6),
          generateThumbnail(file),
        ]);
        onUpdate({
          ...meal,
          photoBlob: compressed,
          photoThumbnail: thumbnail,
        });
        toast.success("Photo added");
      } catch {
        toast.error("Failed to process photo");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [meal, onUpdate]
  );

  const handleRemovePhoto = useCallback(() => {
    onUpdate({ ...meal, photoBlob: null, photoThumbnail: null });
  }, [meal, onUpdate]);

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => !meal.isNil && setExpanded((prev) => !prev)}
      >
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-8 items-center justify-center rounded-full bg-teal-50">
            <Icon className="size-4 text-teal-600" />
          </div>
          <span className="flex-1">{title}</span>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-muted-foreground">NIL</span>
            <Switch
              checked={meal.isNil}
              onCheckedChange={handleNilToggle}
              size="sm"
            />
          </div>
          {!meal.isNil && (
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                expanded && "rotate-180"
              )}
            />
          )}
        </CardTitle>
      </CardHeader>

      {meal.isNil && (
        <CardContent className="pt-0">
          <Badge variant="secondary" className="text-xs">
            No meal recorded
          </Badge>
        </CardContent>
      )}

      {!meal.isNil && expanded && (
        <CardContent className="space-y-3 pt-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-4" />
              {thumbnailUrl ? "Replace Photo" : "Add Photo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoCapture}
            />
            {thumbnailUrl && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={handleRemovePhoto}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>

          {thumbnailUrl && (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden ring-1 ring-foreground/10">
              <img
                src={thumbnailUrl}
                alt={`${title} photo`}
                className="size-full object-cover"
              />
            </div>
          )}

          <Textarea
            placeholder="Describe your meal..."
            value={meal.description}
            onChange={(e) =>
              onUpdate({ ...meal, description: e.target.value })
            }
            className="min-h-20 rounded-xl"
          />
        </CardContent>
      )}
    </Card>
  );
}

interface NumericFieldProps {
  readonly label: string;
  readonly id: string;
  readonly placeholder: string;
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
  readonly hint?: string;
}

function NumericField({ label, id, placeholder, value, onChange, hint }: NumericFieldProps) {
  const [text, setText] = useState(value !== null ? String(value) : "");
  const prevValue = useRef(value);

  // Sync from external changes (e.g. loading from DB) but not from our own edits
  useEffect(() => {
    if (value !== prevValue.current) {
      setText(value !== null ? String(value) : "");
      prevValue.current = value;
    }
  }, [value]);

  const handleBlur = () => {
    const trimmed = text.trim();
    if (trimmed === "") {
      onChange(null);
      prevValue.current = null;
    } else {
      const num = parseFloat(trimmed);
      if (!isNaN(num)) {
        onChange(num);
        prevValue.current = num;
        setText(String(num));
      } else {
        setText(value !== null ? String(value) : "");
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        className="h-11 rounded-xl"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface EntryFormContentProps {
  readonly date: string;
}

function EntryFormContent({ date: initialDate }: EntryFormContentProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const { entry: dbEntry, saveEntry, isLoading } = useEntry(currentDate);
  const [local, setLocal] = useState<DailyEntry | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Sync local state when DB entry loads (new date or first load)
  useEffect(() => {
    if (dbEntry && (!local || local.date !== currentDate)) {
      setLocal(dbEntry);
      setSaveStatus("idle");
    }
  }, [dbEntry, currentDate, local]);

  const doSave = useCallback(
    async (data: DailyEntry) => {
      setSaveStatus("saving");
      try {
        await saveEntry(data);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch {
        toast.error("Failed to save");
        setSaveStatus("idle");
      }
    },
    [saveEntry]
  );

  const scheduleAutosave = useCallback(
    (updated: DailyEntry) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSave(updated), 1500);
    },
    [doSave]
  );

  const updateMeal = useCallback(
    (mealKey: "breakfast" | "lunch" | "dinner", meal: MealEntry) => {
      setLocal((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, [mealKey]: meal };
        scheduleAutosave(updated);
        return updated;
      });
    },
    [scheduleAutosave]
  );

  const updateField = useCallback(
    <K extends keyof DailyEntry>(field: K, value: DailyEntry[K]) => {
      setLocal((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, [field]: value };
        scheduleAutosave(updated);
        return updated;
      });
    },
    [scheduleAutosave]
  );

  const navigateToDate = useCallback(
    async (targetDate: string) => {
      // Flush pending save
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (local) {
        await saveEntry(local);
      }
      // Switch date — triggers useEntry for new date
      setLocal(null);
      setCurrentDate(targetDate);
      // Update URL without full page navigation
      window.history.replaceState(null, "", `/entry/${targetDate}`);
    },
    [local, saveEntry]
  );

  if (isLoading || !local) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  const date = currentDate;
  const entry = local;

  const prevDate = getPrevDate(date);
  const nextDate = getNextDate(date);

  const meals = [
    { key: "breakfast" as const, title: "Breakfast", icon: Coffee },
    { key: "lunch" as const, title: "Lunch", icon: Sun },
    { key: "dinner" as const, title: "Dinner", icon: Moon },
  ] as const;

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateToDate(prevDate)}
          aria-label="Previous day"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="text-center">
          <p className="text-base font-semibold">{formatDate(date)}</p>
          {saveStatus === "saving" && (
            <p className="text-xs text-muted-foreground">Saving...</p>
          )}
          {saveStatus === "saved" && (
            <p className="flex items-center justify-center gap-1 text-xs text-teal-600">
              <Check className="size-3" />
              Saved
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateToDate(nextDate)}
          aria-label="Next day"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div className="space-y-3 px-4 pb-6">
        {meals.map(({ key, title, icon }) => (
          <MealSection
            key={key}
            title={title}
            icon={icon}
            meal={entry[key]}
            onUpdate={(meal) => updateMeal(key, meal)}
          />
        ))}

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Health Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <NumericField
                label="Distance (KM)"
                id="distance"
                placeholder="0.0"
                value={entry.distanceKm}
                onChange={(v) => updateField("distanceKm", v)}
                hint="Enter from your phone's Health app"
              />
              <NumericField
                label="K Calories"
                id="calories"
                placeholder="0"
                value={entry.kCalories}
                onChange={(v) => updateField("kCalories", v)}
              />
              <NumericField
                label="Total Steps"
                id="totalSteps"
                placeholder="0"
                value={entry.totalSteps}
                onChange={(v) => updateField("totalSteps", v)}
                hint="Enter from your phone's Health app"
              />
              <NumericField
                label="Aerobic Steps"
                id="aerobicSteps"
                placeholder="0"
                value={entry.aerobicSteps}
                onChange={(v) => updateField("aerobicSteps", v)}
              />
              <NumericField
                label="Weight (KG)"
                id="weight"
                placeholder="0.0"
                value={entry.weightKg}
                onChange={(v) => updateField("weightKg", v)}
              />
              <div className="space-y-1.5">
                <Label htmlFor="bp" className="text-xs">BP/Pulse</Label>
                <Input
                  id="bp"
                  placeholder="120/80"
                  value={entry.bpPulse}
                  onChange={(e) => updateField("bpPulse", e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="bowel" className="text-xs">Bowel</Label>
                <Input
                  id="bowel"
                  placeholder="Bowel movement details"
                  value={entry.bowel}
                  onChange={(e) => updateField("bowel", e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="alcoholNuts" className="text-xs">Alcohol/Nuts</Label>
                <Input
                  id="alcoholNuts"
                  placeholder="Specify if any"
                  value={entry.alcoholNuts}
                  onChange={(e) => updateField("alcoholNuts", e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="remarks" className="text-xs">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Additional notes..."
                  value={entry.remarks}
                  onChange={(e) => updateField("remarks", e.target.value)}
                  className="min-h-20 rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function EntryFormPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);

  return (
    <main className="flex flex-1 flex-col pb-20">
      <PageHeader title="Daily Entry" showBack />
      <EntryFormContent date={date} />
      <BottomNav />
    </main>
  );
}
