"use client";

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
  icon: React.ComponentType<{ className?: string }>;
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D2340]/98 backdrop-blur-xl border-t border-[#142d52]/60">
      <div className="flex items-end justify-between px-4 pt-2 pb-1">
        {primaryItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-16 py-2 active:opacity-70 transition-opacity duration-150"
            >
              <div className="relative">
                <Icon
                  className={clsx(
                    "w-[26px] h-[26px] transition-all duration-200",
                    isActive
                      ? "text-[#5DA832] drop-shadow-[0_0_8px_rgba(93,168,50,0.4)]"
                      : "text-slate-500"
                  )}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-[#5DA832]" />
                )}
              </div>
              <span
                className={clsx(
                  "text-[10px] font-semibold mt-2 leading-none",
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
          className="flex flex-col items-center justify-center w-16 py-2 active:opacity-70 transition-opacity duration-150"
        >
          <MoreHorizontal
            className="w-[26px] h-[26px] text-slate-500"
            strokeWidth={1.75}
          />
          <span className="text-[10px] font-semibold mt-2 leading-none text-slate-500">
            Mais
          </span>
        </button>
      </div>

      {/* Safe area do iOS — barra de gestos */}
      <div className="h-[calc(env(safe-area-inset-bottom)+6px)]" />
    </nav>
  );
}

export { primaryItems };
