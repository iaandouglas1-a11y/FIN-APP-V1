"use client";

import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, ArrowUpRight, Wallet, TrendingUp, Tags } from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";

export interface BottomNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Barra inferior fixa (mobile). Os demais módulos (Dívidas, Faturas, Notas e
// Gestão PJ) são abertos por atalhos no Dashboard.
const navItems: BottomNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/movimentacoes", label: "Extrato", icon: ArrowUpRight },
  { href: "/contas", label: "Bancos", icon: Wallet },
  { href: "/investimentos", label: "Investim.", icon: TrendingUp },
  { href: "/categorias", label: "Categorias", icon: Tags },
];

function NavItem({ item, isActive }: { item: BottomNavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="flex flex-col items-center justify-center min-h-[52px] flex-1 active:opacity-70 transition-all duration-150"
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
      <span className={clsx("text-[10.5px] font-semibold leading-none", isActive ? "text-[#5DA832]" : "text-ink-tertiary")}>
        {item.label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <nav className="md:hidden fixed z-50 w-full px-4 bottom-[max(10px,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto bg-surface/[0.98] backdrop-blur-xl border border-surface-border/60 rounded-[24px] shadow-sheet">
        <div className="flex items-center justify-around px-1 pt-2.5 pb-2.5">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

export { navItems };
