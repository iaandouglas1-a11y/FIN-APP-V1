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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Barra principal com margem lateral e cantos arredondados no topo */}
      <div className="mx-2 mb-0 bg-[#0D2340]/98 backdrop-blur-xl border-t border-l border-r border-[#142d52]/60 rounded-t-2xl">
        <div className="flex items-end justify-between px-6 pt-3 pb-3">
          {primaryItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 max-w-[72px] py-1 active:opacity-70 transition-opacity duration-150"
              >
                <div className="relative">
                  <Icon
                    className={clsx(
                      "w-7 h-7 transition-all duration-200",
                      isActive
                        ? "text-[#5DA832] drop-shadow-[0_0_8px_rgba(93,168,50,0.4)]"
                        : "text-slate-500"
                    )}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-[#5DA832]" />
                  )}
                </div>
                <span
                  className={clsx(
                    "text-[11px] font-semibold mt-2.5 leading-none",
                    isActive ? "text-[#5DA832]" : "text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Botão "Mais" — abre o drawer com módulos restantes */}
          <button
            onClick={onMoreClick}
            className="flex flex-col items-center justify-center flex-1 max-w-[72px] py-1 active:opacity-70 transition-opacity duration-150"
          >
            <MoreHorizontal
              className="w-7 h-7 text-slate-500"
              strokeWidth={1.75}
            />
            <span className="text-[11px] font-semibold mt-2.5 leading-none text-slate-500">
              Mais
            </span>
          </button>
        </div>
      </div>

      {/* Safe area do iOS — barra de gestos */}
      <div className="h-[calc(env(safe-area-inset-bottom)+10px)] bg-[#0D2340]/80" />
    </nav>
  );
}

export { primaryItems };