"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ArrowUpRight,
  Wallet,
  MoreHorizontal,
  Plus,
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
  onQuickAddClick: () => void;
}

// Itens fixos exibidos na barra inferior. A sequência é intencional: início,
// movimentos, ação rápida, bancos e acesso ao drawer de módulos.
const primaryItems: BottomNavItem[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/movimentacoes", label: "Movimentos", icon: ArrowUpRight },
];
const trailingItems: BottomNavItem[] = [
  { href: "/contas", label: "Bancos", icon: Wallet },
];

function NavItem({ item, isActive }: { item: BottomNavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="flex flex-col items-center justify-center min-h-[52px] w-14 active:opacity-70 transition-all duration-150"
    >
      <div className="relative mb-1">
        <Icon
          className={clsx("w-[19px] h-[19px] transition-all duration-200", isActive ? "text-[#5DA832]" : "text-ink-tertiary")}
          strokeWidth={2.1}
        />
        {isActive && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5DA832]" />
        )}
      </div>
      <span className={clsx("text-[11px] font-semibold leading-none", isActive ? "text-[#5DA832]" : "text-ink-tertiary")}>
        {item.label}
      </span>
    </Link>
  );
}

export function BottomNav({ onMoreClick, onQuickAddClick }: BottomNavProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);
  const isMoreActive = ["/investimentos", "/orcamento", "/faturas", "/dividas", "/honorarios", "/clientes", "/notas", "/categorias"].some(isActive);

  return (
    <nav className="md:hidden fixed z-50 w-full px-4 bottom-[max(10px,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto bg-surface/[0.98] backdrop-blur-xl border border-surface-border/60 rounded-[24px] shadow-sheet">
        <div className="flex items-center justify-around px-2 pt-2.5 pb-2.5">
          {primaryItems.map((item) => (
            <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
          ))}

          {/* FAB central — ação rápida */}
          <button
            onClick={onQuickAddClick}
            className="w-12 h-12 rounded-full bg-[#5DA832] hover:bg-[#6fc23b] flex items-center justify-center active:scale-90 transition-all -mt-4 border-4 border-bg"
            aria-label="Ação rápida"
          >
            <Plus className="w-[22px] h-[22px] text-[#0A0A0A]" strokeWidth={2.5} />
          </button>

          {trailingItems.map((item) => (
            <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
          ))}

          {/* Botão "Mais" */}
          <button
            onClick={onMoreClick}
            className="flex flex-col items-center justify-center min-h-[52px] w-14 active:opacity-70 transition-all duration-150"
          >
            <div className="relative mb-1">
              <MoreHorizontal
                className={clsx("w-[19px] h-[19px]", isMoreActive ? "text-[#5DA832]" : "text-ink-tertiary")}
                strokeWidth={2.1}
              />
              {isMoreActive && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#5DA832]" />
              )}
            </div>
            <span className={clsx("text-[11px] font-semibold leading-none", isMoreActive ? "text-[#5DA832]" : "text-ink-tertiary")}>
              Mais
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export { primaryItems };
