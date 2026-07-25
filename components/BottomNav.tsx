"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ArrowUpRight,
  Wallet,
  Receipt,
  MoreHorizontal,
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

// Itens principais exibidos na barra inferior
const primaryItems: BottomNavItem[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/movimentacoes", label: "Movimentos", icon: ArrowUpRight },
  { href: "/contas", label: "Contas", icon: Wallet },
  { href: "/faturas", label: "Faturas", icon: Receipt },
];

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="
        md:hidden fixed z-50 w-full px-4
        bottom-[max(8px,env(safe-area-inset-bottom))]
      "
    >
      <div
        className="
          max-w-md mx-auto
          bg-[#0D2340]/98 backdrop-blur-xl
          border border-[#142d52]/60
          rounded-2xl
          shadow-[0_-8px_30px_rgba(0,0,0,0.35)]
        "
      >
        <div
          className="
            grid grid-cols-5 items-center
            px-4 pt-3 pb-3
          "
        >
          {primaryItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="
                  flex flex-col items-center justify-center
                  min-h-[56px]
                  active:opacity-70
                  transition-all duration-150
                "
              >
                <div className="relative mb-1">
                  <Icon
                    className={clsx(
                      "w-6 h-6 transition-all duration-200",
                      isActive ? "text-[#5DA832]" : "text-slate-500"
                    )}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />

                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-[#5DA832]" />
                  )}
                </div>

                <span
                  className={clsx(
                    "text-[10px] font-semibold leading-none",
                    isActive ? "text-[#5DA832]" : "text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Botão "Mais" */}
          <button
            onClick={onMoreClick}
            className="
              flex flex-col items-center justify-center
              min-h-[56px]
              active:opacity-70
              transition-all duration-150
            "
          >
            <div className="relative mb-1">
              <MoreHorizontal
                className="w-6 h-6 text-slate-500"
                strokeWidth={1.75}
              />
            </div>

            <span className="text-[10px] font-semibold leading-none text-slate-500">
              Mais
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export { primaryItems };
