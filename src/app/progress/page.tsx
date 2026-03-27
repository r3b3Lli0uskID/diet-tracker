"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Flame,
  Footprints,
  Scale,
  Heart,
  Droplets,
  Apple,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { useProfile } from "@/hooks/useProfile";
import { useEntries } from "@/hooks/useEntries";
import { today } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { DailyEntry, MealEntry } from "@/lib/db/types";

// --- Helper functions ---

function isMealLogged(meal: MealEntry): boolean {
  return meal.isNil || meal.description.trim().length > 0 || meal.photoBlob !== null;
}

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthRange(monthsAgo: number): { start: string; end: string } {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  const ms = String(m + 1).padStart(2, "0");
  return {
    start: `${y}-${ms}-01`,
    end: `${y}-${ms}-${String(lastDay).padStart(2, "0")}`,
  };
}

function getLatestWeight(entries: readonly DailyEntry[]): number | null {
  for (const entry of entries) {
    if (entry.weightKg !== null) return entry.weightKg;
  }
  return null;
}

function getWeightOnOrBefore(
  entries: readonly DailyEntry[],
  targetDate: string
): number | null {
  for (const entry of entries) {
    if (entry.date <= targetDate && entry.weightKg !== null) {
      return entry.weightKg;
    }
  }
  return null;
}

function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function getBmiCategory(bmi: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600", bgColor: "bg-blue-100" };
  if (bmi < 25) return { label: "Normal", color: "text-green-600", bgColor: "bg-green-100" };
  if (bmi < 30) return { label: "Overweight", color: "text-yellow-600", bgColor: "bg-yellow-100" };
  return { label: "Obese", color: "text-red-600", bgColor: "bg-red-100" };
}

const HEALTH_TIPS = [
  { icon: Droplets, tip: "Drink at least 8 glasses of water daily" },
  { icon: Footprints, tip: "Try to walk 10,000 steps every day" },
  { icon: Apple, tip: "Include fruits and vegetables in every meal" },
  { icon: Heart, tip: "Get at least 7-8 hours of sleep each night" },
  { icon: Flame, tip: "Take short walks after meals to aid digestion" },
  { icon: Scale, tip: "Weigh yourself at the same time each day for consistency" },
  { icon: Lightbulb, tip: "Plan your meals ahead to avoid unhealthy choices" },
  { icon: Award, tip: "Celebrate small wins to stay motivated" },
] as const;

// --- Components ---

interface BmiCardProps {
  readonly currentWeight: number | null;
  readonly heightCm: number | null;
  readonly targetWeight: number | null;
}

function BmiCard({ currentWeight, heightCm, targetWeight }: BmiCardProps) {
  if (currentWeight === null || heightCm === null) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="size-4 text-teal-600" />
            BMI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {heightCm === null
              ? "Add your height in your profile to see your BMI."
              : "Log your weight in a daily entry to see your BMI."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const bmi = calculateBmi(currentWeight, heightCm);
  const category = getBmiCategory(bmi);
  const weightDiff =
    targetWeight !== null ? currentWeight - targetWeight : null;

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="size-4 text-teal-600" />
          Body Mass Index
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{bmi.toFixed(1)}</p>
            <Badge className={cn("mt-1", category.bgColor, category.color)}>
              {category.label}
            </Badge>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current</span>
              <span className="font-semibold">{currentWeight} kg</span>
            </div>
            {targetWeight !== null && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-semibold">{targetWeight} kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span
                    className={cn(
                      "font-semibold",
                      weightDiff !== null && weightDiff <= 0
                        ? "text-green-600"
                        : "text-orange-600"
                    )}
                  >
                    {weightDiff !== null
                      ? weightDiff <= 0
                        ? "At target!"
                        : `${weightDiff.toFixed(1)} kg to go`
                      : "--"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface WeightTrendCardProps {
  readonly entries: readonly DailyEntry[];
  readonly currentWeight: number | null;
  readonly targetWeight: number | null;
}

function WeightTrendCard({ entries, currentWeight, targetWeight }: WeightTrendCardProps) {
  const sevenDaysAgo = getDateNDaysAgo(7);
  const thirtyDaysAgo = getDateNDaysAgo(30);

  const weight7d = getWeightOnOrBefore(entries, sevenDaysAgo);
  const weight30d = getWeightOnOrBefore(entries, thirtyDaysAgo);

  const diff7d = currentWeight !== null && weight7d !== null ? currentWeight - weight7d : null;
  const diff30d = currentWeight !== null && weight30d !== null ? currentWeight - weight30d : null;

  const getMessage = (): string => {
    if (currentWeight === null) return "Start logging your weight to see trends.";
    if (targetWeight !== null && Math.abs(currentWeight - targetWeight) < 0.5) {
      return "Amazing! You've reached your target weight!";
    }
    if (diff7d !== null && diff7d < -0.1) {
      return `Great progress! You've lost ${Math.abs(diff7d).toFixed(1)} kg this week!`;
    }
    if (diff7d !== null && diff7d > 0.1 && targetWeight !== null && currentWeight > targetWeight) {
      return "Small setback -- you've got this! Stay focused.";
    }
    if (diff7d !== null && Math.abs(diff7d) <= 0.1) {
      return "Staying consistent -- keep it up!";
    }
    return "Keep logging to track your progress.";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-teal-600" />
          Weight Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentWeight === null ? (
          <p className="text-sm text-muted-foreground">Log your weight to see trends.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <TrendItem
                label="vs 7 days ago"
                diff={diff7d}
                noData={weight7d === null}
              />
              <TrendItem
                label="vs 30 days ago"
                diff={diff30d}
                noData={weight30d === null}
              />
            </div>
            <div className="rounded-xl bg-teal-50 px-4 py-3">
              <p className="text-sm font-medium text-teal-800">{getMessage()}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface TrendItemProps {
  readonly label: string;
  readonly diff: number | null;
  readonly noData: boolean;
}

function TrendItem({ label, diff, noData }: TrendItemProps) {
  if (noData || diff === null) {
    return (
      <div className="rounded-xl bg-muted/50 p-3 text-center">
        <p className="text-lg font-bold text-muted-foreground">--</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    );
  }

  const isLoss = diff < -0.05;
  const isGain = diff > 0.05;

  return (
    <div className="rounded-xl bg-muted/50 p-3 text-center">
      <div className="flex items-center justify-center gap-1">
        {isLoss && <ArrowDown className="size-4 text-green-600" />}
        {isGain && <ArrowUp className="size-4 text-red-500" />}
        {!isLoss && !isGain && <Minus className="size-4 text-muted-foreground" />}
        <p
          className={cn(
            "text-lg font-bold",
            isLoss && "text-green-600",
            isGain && "text-red-500",
            !isLoss && !isGain && "text-muted-foreground"
          )}
        >
          {Math.abs(diff).toFixed(1)} kg
        </p>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface WeeklySummaryCardProps {
  readonly entries: readonly DailyEntry[];
}

function WeeklySummaryCard({ entries }: WeeklySummaryCardProps) {
  const weekStart = getWeekStart();
  const todayDate = today();

  const weekEntries = useMemo(
    () => entries.filter((e) => e.date >= weekStart && e.date <= todayDate),
    [entries, weekStart, todayDate]
  );

  const mealsLogged = useMemo(() => {
    let count = 0;
    for (const entry of weekEntries) {
      if (isMealLogged(entry.breakfast)) count++;
      if (isMealLogged(entry.lunch)) count++;
      if (isMealLogged(entry.dinner)) count++;
    }
    return count;
  }, [weekEntries]);

  const avgSteps = useMemo(() => {
    const withSteps = weekEntries.filter((e) => e.totalSteps !== null);
    if (withSteps.length === 0) return null;
    const sum = withSteps.reduce((acc, e) => acc + (e.totalSteps ?? 0), 0);
    return Math.round(sum / withSteps.length);
  }, [weekEntries]);

  const avgDistance = useMemo(() => {
    const withDist = weekEntries.filter((e) => e.distanceKm !== null);
    if (withDist.length === 0) return null;
    const sum = withDist.reduce((acc, e) => acc + (e.distanceKm ?? 0), 0);
    return sum / withDist.length;
  }, [weekEntries]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="size-4 text-teal-600" />
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <StatBox
            icon={Flame}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
            value={`${mealsLogged}/21`}
            label="Meals logged"
          />
          <StatBox
            icon={Footprints}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            value={avgSteps !== null ? avgSteps.toLocaleString() : "--"}
            label="Avg daily steps"
          />
          <StatBox
            icon={Target}
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
            value={avgDistance !== null ? `${avgDistance.toFixed(1)} km` : "--"}
            label="Avg daily distance"
          />
          <StatBox
            icon={Heart}
            iconBg="bg-red-50"
            iconColor="text-red-400"
            value={String(weekEntries.length)}
            label="Days with entries"
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface StatBoxProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly value: string;
  readonly label: string;
}

function StatBox({ icon: Icon, iconBg, iconColor, value, label }: StatBoxProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
      <div className={cn("flex size-9 items-center justify-center rounded-full", iconBg)}>
        <Icon className={cn("size-4", iconColor)} />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

interface MonthlyComparisonCardProps {
  readonly entries: readonly DailyEntry[];
}

function MonthlyComparisonCard({ entries }: MonthlyComparisonCardProps) {
  const thisMonth = getMonthRange(0);
  const lastMonth = getMonthRange(1);

  const thisMonthEntries = useMemo(
    () => entries.filter((e) => e.date >= thisMonth.start && e.date <= thisMonth.end),
    [entries, thisMonth.start, thisMonth.end]
  );

  const lastMonthEntries = useMemo(
    () => entries.filter((e) => e.date >= lastMonth.start && e.date <= lastMonth.end),
    [entries, lastMonth.start, lastMonth.end]
  );

  const avgWeight = (list: readonly DailyEntry[]): number | null => {
    const withWeight = list.filter((e) => e.weightKg !== null);
    if (withWeight.length === 0) return null;
    return withWeight.reduce((s, e) => s + (e.weightKg ?? 0), 0) / withWeight.length;
  };

  const avgSteps = (list: readonly DailyEntry[]): number | null => {
    const withSteps = list.filter((e) => e.totalSteps !== null);
    if (withSteps.length === 0) return null;
    return Math.round(withSteps.reduce((s, e) => s + (e.totalSteps ?? 0), 0) / withSteps.length);
  };

  const mealsCount = (list: readonly DailyEntry[]): number => {
    let count = 0;
    for (const entry of list) {
      if (isMealLogged(entry.breakfast)) count++;
      if (isMealLogged(entry.lunch)) count++;
      if (isMealLogged(entry.dinner)) count++;
    }
    return count;
  };

  const thisAvgWeight = avgWeight(thisMonthEntries);
  const lastAvgWeight = avgWeight(lastMonthEntries);
  const thisAvgSteps = avgSteps(thisMonthEntries);
  const lastAvgSteps = avgSteps(lastMonthEntries);
  const thisMeals = mealsCount(thisMonthEntries);
  const lastMeals = mealsCount(lastMonthEntries);

  if (lastMonthEntries.length === 0 && thisMonthEntries.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-teal-600" />
          Monthly Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ComparisonRow
          label="Avg Weight"
          thisValue={thisAvgWeight !== null ? `${thisAvgWeight.toFixed(1)} kg` : "--"}
          lastValue={lastAvgWeight !== null ? `${lastAvgWeight.toFixed(1)} kg` : "--"}
          improved={
            thisAvgWeight !== null && lastAvgWeight !== null
              ? thisAvgWeight < lastAvgWeight
              : null
          }
        />
        <ComparisonRow
          label="Avg Steps"
          thisValue={thisAvgSteps !== null ? thisAvgSteps.toLocaleString() : "--"}
          lastValue={lastAvgSteps !== null ? lastAvgSteps.toLocaleString() : "--"}
          improved={
            thisAvgSteps !== null && lastAvgSteps !== null
              ? thisAvgSteps > lastAvgSteps
              : null
          }
        />
        <ComparisonRow
          label="Meals Logged"
          thisValue={String(thisMeals)}
          lastValue={String(lastMeals)}
          improved={lastMeals > 0 ? thisMeals > lastMeals : null}
        />
      </CardContent>
    </Card>
  );
}

interface ComparisonRowProps {
  readonly label: string;
  readonly thisValue: string;
  readonly lastValue: string;
  readonly improved: boolean | null;
}

function ComparisonRow({ label, thisValue, lastValue, improved }: ComparisonRowProps) {
  return (
    <div className="flex items-center rounded-xl bg-muted/50 px-4 py-3">
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{thisValue}</p>
      </div>
      <div className="px-3">
        {improved === true && <ArrowUp className="size-4 text-green-600" />}
        {improved === false && <ArrowDown className="size-4 text-red-500" />}
        {improved === null && <Minus className="size-4 text-muted-foreground" />}
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Last month</p>
        <p className="text-sm text-muted-foreground">{lastValue}</p>
      </div>
    </div>
  );
}

function MotivationalTips() {
  const tipIndex = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dayOfYear % HEALTH_TIPS.length;
  }, []);

  const tip = HEALTH_TIPS[tipIndex];
  const TipIcon = tip.icon;

  return (
    <Card className="border-0 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-sm">
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <TipIcon className="size-5 text-teal-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            Daily Tip
          </p>
          <p className="text-sm font-medium text-foreground">{tip.tip}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main page ---

export default function ProgressPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { entries, isLoading: entriesLoading } = useEntries();

  const currentWeight = useMemo(() => getLatestWeight(entries), [entries]);
  const heightCm = profile?.height ?? null;
  const targetWeight = profile?.targetWeight ?? null;

  if (profileLoading || entriesLoading) {
    return (
      <main className="flex flex-1 flex-col pb-20">
        <PageHeader title="Progress" />
        <div className="flex flex-1 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col pb-20">
      <PageHeader title="Progress" subtitle="Your health journey" />

      <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-6">
        <BmiCard
          currentWeight={currentWeight}
          heightCm={heightCm}
          targetWeight={targetWeight}
        />

        <WeightTrendCard
          entries={entries}
          currentWeight={currentWeight}
          targetWeight={targetWeight}
        />

        <WeeklySummaryCard entries={entries} />

        <MonthlyComparisonCard entries={entries} />

        <MotivationalTips />
      </div>

      <BottomNav />
    </main>
  );
}
