"use client";

import Link from "next/link";
import {
  Plus,
  UtensilsCrossed,
  ChevronRight,
  CalendarDays,
  Coffee,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { useEntries } from "@/hooks/useEntries";
import { today, formatDate } from "@/lib/utils/date";
import type { MealEntry } from "@/lib/db/types";

function isMealLogged(meal: MealEntry): boolean {
  return meal.isNil || meal.description.trim().length > 0 || meal.photoBlob !== null;
}

function EmptyState() {
  const todayDate = today();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
        <CalendarDays className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-foreground">No entries yet</h3>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Start tracking your meals and health metrics today.
      </p>
      <Button
        className="h-11 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white hover:bg-teal-700"
        nativeButton={false}
        render={<Link href={`/entry/${todayDate}`} />}
      >
        <Plus className="size-4" />
        Create First Entry
      </Button>
    </div>
  );
}

export default function EntryListPage() {
  const { entries, isLoading } = useEntries();
  const todayDate = today();

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col pb-20">
        <PageHeader title="Entries" />
        <div className="flex flex-1 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col pb-20">
      <PageHeader title="Entries" subtitle={`${entries.length} total entries`} />

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mx-auto w-full max-w-lg space-y-2 px-4 py-4">
          {entries.map((entry) => {
            const bLogged = isMealLogged(entry.breakfast);
            const lLogged = isMealLogged(entry.lunch);
            const dLogged = isMealLogged(entry.dinner);
            const isToday = entry.date === todayDate;

            return (
              <Link
                key={entry.id}
                href={`/entry/${entry.date}`}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/5 transition-all active:scale-[0.98]"
              >
                <div className="flex size-11 items-center justify-center rounded-full bg-teal-50">
                  <UtensilsCrossed className="size-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{formatDate(entry.date)}</p>
                    {isToday && (
                      <Badge className="bg-teal-100 text-teal-700 text-[10px]">
                        Today
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`flex items-center gap-0.5 text-[11px] ${
                        bLogged ? "text-teal-600" : "text-muted-foreground"
                      }`}
                    >
                      <Coffee className="size-3" />B
                    </span>
                    <span
                      className={`flex items-center gap-0.5 text-[11px] ${
                        lLogged ? "text-teal-600" : "text-muted-foreground"
                      }`}
                    >
                      <Sun className="size-3" />L
                    </span>
                    <span
                      className={`flex items-center gap-0.5 text-[11px] ${
                        dLogged ? "text-teal-600" : "text-muted-foreground"
                      }`}
                    >
                      <Moon className="size-3" />D
                    </span>
                    {entry.weightKg !== null && (
                      <>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-[11px] text-muted-foreground">
                          {entry.weightKg} kg
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href={`/entry/${todayDate}`}
        className="fixed bottom-20 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg shadow-teal-500/30 transition-all hover:bg-teal-700 active:scale-95"
        aria-label="Add new entry"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <Plus className="size-6" />
      </Link>

      <BottomNav />
    </main>
  );
}
