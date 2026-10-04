"use client";

import { useState } from "react";
import {
  LayoutDashboard, ArrowUpRight, Receipt, Wallet, Tags, ChevronRight, Users,
  TrendingDown, TrendingUp, HandCoins, StickyNote, PiggyBank, Bell, Plus,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";
import { OnfinLogo, OnfinTile } from "./OnfinLogo";
import { BottomNav } from "./BottomNav";
import { MoreMenuDrawer } from "./MoreMenuDrawer";
import { QuickActionSheet } from "./QuickActionSheet";

const navGroups = [
  {
    group: "Visão",
    items: [
      { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
      { href: "/movimentacoes", label: "Movimentações", icon: ArrowUpRight },
    ],
  },
  {
    group: "Finanças",
    items: [
      { href: "/contas", label: "Contas", icon: Wallet },
      { href: "/faturas", label: "Faturas", icon: Receipt },
      { href: "/orcamento", label: "Orçamento", icon: PiggyBank },
      { href: "/dividas", label: "Dívidas", icon: TrendingDown },
      { href: "/investimentos", label: "Investimentos", icon: TrendingUp },
    ],
  },
  {
    group: "Profissional",
    items: [
      { href: "/notas", label: "Notas", icon: StickyNote },
      { href: "/honorarios", label: "Honorários", icon: HandCoins },
      { href: "/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    group: "Sistema",
    items: [{ href: "/categorias", label: "Categorias", icon: Tags }],
  },
];

const allNavItems = navGroups.flatMap((group) => group.items);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const pathname = usePathname();
  const currentLabel = allNavItems.find((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))?.label ?? "Visão geral";

  const SidebarContent = () => (
    <div className="flex h-full flex-col border-r border-surface-border/80 bg-bg">
      <div className="border-b border-surface-border/80 p-5">
        <div className={clsx("flex items-center gap-3", !isSidebarOpen && "md:justify-center md:gap-0")}>
          {isSidebarOpen ? <OnfinLogo variant="horizontal" className="h-9 w-auto" /> : <OnfinTile size={40} />}
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {navGroups.map((group) => (
          <div key={group.group}>
            <p className={clsx("mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-tertiary transition-all", !isSidebarOpen && "md:h-0 md:w-0 md:overflow-hidden md:opacity-0")}>
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "group/nav relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 transition-all duration-200",
                      !isSidebarOpen && "md:justify-center md:gap-0 md:px-0",
                      isActive
                        ? "border-[#5DA832]/30 bg-[#5DA832]/15 text-[#8FCB5E]"
                        : "border-transparent text-ink-secondary hover:border-surface-border/60 hover:bg-surface-2/60 hover:text-ink-primary",
                    )}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <Icon className={clsx("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-[#5DA832]" : "text-ink-tertiary group-hover/nav:text-[#8FCB5E]")} />
                    <span className={clsx("text-sm font-medium transition-all", !isSidebarOpen && "md:w-0 md:overflow-hidden md:opacity-0")}>{item.label}</span>
                    {isActive && isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-surface-border/80 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-xs font-bold text-ink-primary">DG</div>
          <div className={clsx("min-w-0 transition-all", !isSidebarOpen && "md:w-0 md:overflow-hidden md:opacity-0")}>
            <strong className="block truncate text-xs text-ink-primary">Douglas Gomes</strong>
            <span className="block text-[10px] text-ink-tertiary">Plano pessoal</span>
          </div>
          <button className={clsx("ml-auto rounded-xl border border-surface-border/70 px-2.5 py-2 text-ink-tertiary hover:text-ink-primary", !isSidebarOpen && "md:hidden")} aria-label="Abrir perfil">•••</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg md:flex">
      <aside className={clsx("fixed inset-y-0 left-0 z-40 hidden flex-col transition-all duration-300 md:flex", isSidebarOpen ? "w-64" : "w-24")}>
        <SidebarContent />
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-24 rounded-full border border-surface-border/80 bg-surface p-1.5 text-ink-tertiary transition-colors hover:text-[#5DA832]" aria-label={isSidebarOpen ? "Recolher menu" : "Expandir menu"}>
          <ChevronRight className={clsx("h-4 w-4 transition-transform", isSidebarOpen && "rotate-180")} />
        </button>
      </aside>

      <main className={clsx("min-w-0 flex-1 transition-all duration-300", isSidebarOpen ? "md:pl-64" : "md:pl-24")}>
        <div aria-hidden className="app-top-cover fixed inset-x-0 top-0 z-40 bg-bg pointer-events-none md:hidden" />
        <div className="app-top-pad min-h-screen px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:px-8 md:pb-8">
          <header className="sticky top-0 z-30 -mx-4 mb-7 flex h-[66px] items-center justify-between border-b border-surface-border/70 bg-bg/90 px-4 backdrop-blur-xl md:-mx-8 md:px-8">
            <div className="flex items-center gap-2 text-xs text-ink-tertiary"><span>Onfin</span><span>/</span><strong className="text-ink-primary">{currentLabel}</strong></div>
            <div className="flex items-center gap-2">
              <button className="hidden h-10 items-center gap-2 rounded-xl border border-surface-border/70 bg-surface px-3 text-xs font-semibold text-[#8FCB5E] transition-colors hover:border-[#5DA832]/40 md:flex" onClick={() => setIsQuickAddOpen(true)}><Plus className="h-4 w-4" /> Ação rápida</button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border/70 bg-surface text-ink-tertiary transition-colors hover:text-ink-primary" aria-label="Notificações"><Bell className="h-4 w-4" /></button>
            </div>
          </header>
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">{children}</div>
        </div>
      </main>

      <BottomNav onMoreClick={() => setIsMoreMenuOpen(true)} onQuickAddClick={() => setIsQuickAddOpen(true)} />
      <MoreMenuDrawer open={isMoreMenuOpen} onClose={() => setIsMoreMenuOpen(false)} />
      <QuickActionSheet open={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
}
