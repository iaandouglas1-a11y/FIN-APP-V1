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
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/movimentacoes", label: "Movimentos", icon: ArrowUpRight },
  { href: "/contas", label: "Contas", icon: Wallet },
  { href: "/faturas", label: "Faturas", icon: Receipt },
];

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D2340]/95 backdrop-blur-xl border-t border-[#142d52]/80 rounded-t-2xl safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {primaryItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-0",
                isActive
                  ? "text-[#5DA832]"
                  : "text-slate-500 active:text-slate-300"
              )}
            >
              <div className="relative">
                <Icon
                  className={clsx(
                    "h-6 w-6 shrink-0 transition-all duration-200",
                    isActive && "drop-shadow-[0_0_6px_rgba(93,168,50,0.5)]"
                  )}
                />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5DA832]" />
                )}
              </div>
              <span
                className={clsx(
                  "text-[10px] font-medium mt-1.5 leading-none",
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
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-0 text-slate-500 active:text-slate-300"
        >
          <MoreHorizontal className="h-6 w-6 shrink-0" />
          <span className="text-[10px] font-medium mt-1.5 leading-none text-slate-500">
            Mais
          </span>
        </button>
      </div>
    </nav>
  );
}

export { primaryItems };
