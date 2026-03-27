"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly showBack?: boolean;
}

export function PageHeader({ title, subtitle, showBack = false }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
        {showBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-semibold leading-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
