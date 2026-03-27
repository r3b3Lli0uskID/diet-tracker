"use client";

import Link from "next/link";
import {
  Heart,
  CalendarPlus,
  ChevronRight,
  Sparkles,
  Activity,
  Scale,
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  Phone,
  MessageCircle,
  Globe,
} from "lucide-react";

function InstagramIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BottomNav } from "@/components/layout/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useEntries } from "@/hooks/useEntries";
import { today, formatDate } from "@/lib/utils/date";
import type { DailyEntry, MealEntry } from "@/lib/db/types";

function isMealLogged(meal: MealEntry): boolean {
  return meal.isNil || meal.description.trim().length > 0 || meal.photoBlob !== null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function WelcomeCard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <img
        src="/clinic-logo.jpg"
        alt="All Derma Medical Clinic"
        className="mb-6 size-20 rounded-full border-2 border-teal-200 object-cover"
      />
      <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
        Welcome to DietTracker
      </h2>
      <p className="mb-1 text-center text-sm text-muted-foreground">
        All Derma Medical Clinic
      </p>
      <p className="mb-6 max-w-xs text-center text-sm text-muted-foreground">
        Track your daily meals, health metrics, and progress all in one place.
      </p>

      <div className="mb-6 flex items-center gap-4">
        <a
          href="https://www.instagram.com/alldermaofficial/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-colors hover:bg-teal-100"
          aria-label="Instagram"
        >
          <InstagramIcon className="size-5" />
        </a>
        <a
          href="https://www.facebook.com/alldermamedicalclinic"
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-colors hover:bg-teal-100"
          aria-label="Facebook"
        >
          <FacebookIcon className="size-5" />
        </a>
        <a
          href="https://www.alldermamedicalclinic.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-colors hover:bg-teal-100"
          aria-label="Visit website"
        >
          <Globe className="size-5" />
        </a>
      </div>

      <div className="mb-8 flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <a
          href="tel:+6562380979"
          className="flex items-center gap-2 transition-colors hover:text-teal-600"
        >
          <Phone className="size-4" />
          +65 6238 0979
        </a>
        <a
          href="https://wa.me/6598364006"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition-colors hover:text-teal-600"
        >
          <MessageCircle className="size-4" />
          +65 9836 4006 (WhatsApp)
        </a>
      </div>

      <Button
        className="h-12 rounded-xl bg-teal-600 px-8 text-base font-semibold text-white hover:bg-teal-700"
        nativeButton={false}
        render={<Link href="/profile" />}
      >
        <Sparkles className="size-5" />
        Get Started
      </Button>

      <p className="mt-8 text-xs text-muted-foreground">
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
  );
}

function TodayEntryCard({ entry }: { readonly entry: DailyEntry | undefined }) {
  const todayDate = today();

  if (!entry) {
    return (
      <Card className="border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20">
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <CalendarPlus className="size-10 opacity-80" />
          <p className="text-center text-sm opacity-90">
            No entry for today yet
          </p>
          <Button
            className="h-11 rounded-xl bg-white/20 px-6 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/30"
            nativeButton={false}
            render={<Link href={`/entry/${todayDate}`} />}
          >
            Start Today&apos;s Log
          </Button>
        </CardContent>
      </Card>
    );
  }

  const meals = [
    { name: "Breakfast", icon: Coffee, meal: entry.breakfast },
    { name: "Lunch", icon: Sun, meal: entry.lunch },
    { name: "Dinner", icon: Moon, meal: entry.dinner },
  ] as const;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">Today&apos;s Entry</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-teal-600"
            nativeButton={false}
            render={<Link href={`/entry/${todayDate}`} />}
          >
            Edit
            <ChevronRight className="size-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          {meals.map(({ name, icon: Icon, meal }) => {
            const logged = isMealLogged(meal);
            return (
              <div
                key={name}
                className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-muted/50 p-3"
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-full ${
                    logged ? "bg-teal-100 text-teal-600" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <span className="text-xs font-medium">{name}</span>
                {meal.isNil ? (
                  <Badge variant="secondary" className="text-[10px]">NIL</Badge>
                ) : logged ? (
                  <Badge className="bg-teal-100 text-teal-700 text-[10px]">Done</Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Pending</span>
                )}
              </div>
            );
          })}
        </div>
        {entry.weightKg !== null && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Scale className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Weight:</span>
            <span className="text-sm font-semibold">{entry.weightKg} kg</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickStats({
  weekEntries,
  latestWeight,
}: {
  readonly weekEntries: readonly DailyEntry[];
  readonly latestWeight: number | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/5">
        <div className="flex size-10 items-center justify-center rounded-full bg-blue-50">
          <Activity className="size-5 text-blue-500" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{weekEntries.length}</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-foreground/5">
        <div className="flex size-10 items-center justify-center rounded-full bg-purple-50">
          <Scale className="size-5 text-purple-500" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {latestWeight !== null ? `${latestWeight}` : "--"}
          </p>
          <p className="text-xs text-muted-foreground">
            {latestWeight !== null ? "kg latest" : "No weight"}
          </p>
        </div>
      </div>
    </div>
  );
}

function RecentEntries({ entries }: { readonly entries: readonly DailyEntry[] }) {
  if (entries.length === 0) return null;

  const recent = entries.slice(0, 5);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent Entries</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-teal-600"
          nativeButton={false}
          render={<Link href="/entry" />}
        >
          View all
        </Button>
      </div>
      <div className="space-y-2">
        {recent.map((entry) => {
          const mealsLogged = [
            isMealLogged(entry.breakfast),
            isMealLogged(entry.lunch),
            isMealLogged(entry.dinner),
          ].filter(Boolean).length;

          return (
            <Link
              key={entry.id}
              href={`/entry/${entry.date}`}
              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-foreground/5 transition-all active:scale-[0.98]"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-teal-50">
                <UtensilsCrossed className="size-4 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                <p className="text-xs text-muted-foreground">
                  {mealsLogged}/3 meals logged
                  {entry.weightKg !== null && ` \u00B7 ${entry.weightKg} kg`}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { entries, isLoading: entriesLoading } = useEntries();
  const todayDate = today();
  const weekStart = getWeekStart();
  const todayEntry = entries.find((e) => e.date === todayDate);

  const weekEntries = entries.filter((e) => e.date >= weekStart && e.date <= todayDate);

  const latestWeight = entries.reduce<number | null>((latest, entry) => {
    if (entry.weightKg !== null && latest === null) return entry.weightKg;
    return latest;
  }, null);

  if (profileLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <main className="flex flex-1 flex-col pb-20">
        <WelcomeCard />
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col pb-20">
      <div className="mx-auto w-full max-w-lg px-4 py-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">{getGreeting()},</p>
          <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
        </div>

        <div className="space-y-4">
          <TodayEntryCard entry={todayEntry} />
          <QuickStats weekEntries={weekEntries} latestWeight={latestWeight} />
          <Separator />
          <RecentEntries entries={entries} />
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
