"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, TrendingUp, CalendarDays, FileDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly matchPrefix: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: House, matchPrefix: "/" },
  { href: "/progress", label: "Progress", icon: TrendingUp, matchPrefix: "/progress" },
  { href: "/entry", label: "Entries", icon: CalendarDays, matchPrefix: "/entry" },
  { href: "/export", label: "Export", icon: FileDown, matchPrefix: "/export" },
  { href: "/settings", label: "Settings", icon: Settings, matchPrefix: "/settings" },
] as const;

function isActive(pathname: string, item: NavItem): boolean {
  if (item.matchPrefix === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(item.matchPrefix);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-white/80 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-2.5 py-1.5 text-xs font-medium transition-all",
                active
                  ? "text-teal-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <span
                  className="absolute -top-1 h-1 w-8 rounded-full bg-teal-500"
                  aria-hidden="true"
                />
              )}
              <Icon
                className={cn(
                  "size-5 transition-all",
                  active && "scale-110"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
