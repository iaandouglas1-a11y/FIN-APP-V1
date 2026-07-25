"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, ArrowUpRight, Wallet, Receipt,
  MoreHorizontal
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";

export interface BottomNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  onMoreClick: () => void;
}

const primaryItems: BottomNavItem[] = [
  { href: "/dashboard",     label: "Início",     icon: LayoutDashboard },
  { href: "/movimentacoes", label: "Movimentos", icon: ArrowUpRight },
  { href: "/contas",        label: "Contas",     icon: Wallet },
  { href: "/faturas",       label: "Faturas",    icon: Receipt },
];

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D2340]/98 backdrop-blur-xl border-t border-[#142d52]/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {primaryItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 gap-1 py-1 active:opacity-70 transition-opacity duration-150"
            >
              <Icon
                className={clsx(
                  "w-6 h-6 transition-all duration-200",
                  isActive ? "text-[#5DA832]" : "text-slate-500"
                )}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              {isActive && (
                <span className="w-5 h-[2px] rounded-full bg-[#5DA832]" />
              )}
              <span className={clsx(
                "text-[10px] font-semibold leading-none",
                isActive ? "text-[#5DA832]" : "text-slate-500"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center flex-1 gap-1 py-1 active:opacity-70 transition-opacity duration-150"
        >
          <MoreHorizontal className="w-6 h-6 text-slate-500" strokeWidth={1.75} />
          <span className="text-[10px] font-semibold leading-none text-slate-500">Mais</span>
        </button>
      </div>
    </nav>
  );
}

export { primaryItems };
