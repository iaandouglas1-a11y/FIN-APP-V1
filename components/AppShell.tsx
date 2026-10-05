"use client";

import { useState } from "react";
import {
  LayoutDashboard, ArrowUpRight,
  Receipt, Wallet, Tags, ChevronRight, TrendingDown, TrendingUp, StickyNote, PiggyBank, Briefcase,
  Search, Filter, Pencil, type LucideIcon
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";
import { OnfinLogo, OnfinTile } from "./OnfinLogo";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const pageHeader = [
    { href: "/dashboard", title: "Meu Onfin", icon: Search },
    { href: "/movimentacoes", title: "Extrato", icon: Filter },
    { href: "/contas", title: "Bancos e cartões", icon: Pencil },
    { href: "/investimentos", title: "Investimentos", icon: TrendingUp },
    { href: "/categorias", title: "Categorias", icon: Tags },
    { href: "/faturas", title: "Faturas", icon: Receipt },
    { href: "/dividas", title: "Dívidas", icon: TrendingDown },
    { href: "/notas", title: "Notas", icon: StickyNote },
    { href: "/orcamento", title: "Orçamento", icon: PiggyBank },
    { href: "/gestao-pj", title: "Gestão PJ", icon: Briefcase },
  ].find(({ href }) => pathname === href || pathname?.startsWith(`${href}/`)) ?? {
    href: "/dashboard", title: "Meu Onfin", icon: Search,
  };
  const PageHeaderIcon = pageHeader.icon as LucideIcon;

  const navItems = [
    {
      group: "Principal",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/movimentacoes", label: "Extrato", icon: ArrowUpRight },
        { href: "/contas", label: "Bancos e Contas", icon: Wallet },
        { href: "/investimentos", label: "Investimentos", icon: TrendingUp },
        { href: "/categorias", label: "Categorias", icon: Tags },
      ]
    },
    {
      group: "Gestão",
      items: [
        { href: "/dividas", label: "Dívidas", icon: TrendingDown },
        { href: "/faturas", label: "Faturas", icon: Receipt },
        { href: "/notas", label: "Notas", icon: StickyNote },
        { href: "/gestao-pj", label: "Gestão PJ", icon: Briefcase },
        { href: "/orcamento", label: "Orçamento", icon: PiggyBank },
      ]
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface border-r border-surface-border/80">
      <div className="p-4 border-b border-surface-border/80">
        <div className={clsx(
          "flex items-center gap-3 group cursor-pointer",
          !isSidebarOpen && "md:justify-center md:gap-0"
        )}>
          {isSidebarOpen ? (
            <OnfinLogo variant="horizontal" className="h-9 w-auto" />
          ) : (
            <OnfinTile size={40} />
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className={clsx(
              "text-[11px] font-semibold text-[#5DA832]/50 mb-3 px-3 transition-all duration-300",
              !isSidebarOpen && "md:opacity-0 md:w-0"
            )}>
              {group.group}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group/nav relative overflow-hidden",
                      !isSidebarOpen && "md:justify-center md:px-0 md:gap-0",
                      isActive
                        ? "bg-[#5DA832]/15 text-[#8FCB5E] border border-[#5DA832]/30"
                        : "text-slate-400 hover:bg-surface-2/60 hover:text-slate-200 border border-transparent hover:border-surface-border/40"
                    )}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <Icon className={clsx(
                      "h-5 w-5 shrink-0 transition-all duration-200",
                      isActive ? "text-[#5DA832]" : "text-slate-500 group-hover/nav:text-[#5DA832]/80"
                    )} />
                    <span className={clsx(
                      "text-sm font-medium transition-all duration-300",
                      !isSidebarOpen && "md:opacity-0 md:w-0"
                    )}>
                      {item.label}
                    </span>
                    {isActive && isSidebarOpen && (
                      <ChevronRight className="h-4 w-4 ml-auto opacity-60 group-hover/nav:opacity-100 transition-opacity" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Sidebar desktop (inalterado) ── */}
      <aside className={clsx(
        "hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-40",
        isSidebarOpen ? "w-72" : "w-24"
      )}>
        <SidebarContent />
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 bg-surface border border-surface-border/80 text-slate-400 hover:text-[#5DA832] rounded-full p-1.5 transition-all duration-200"
        >
          <ChevronRight className={clsx("h-4 w-4 transition-transform duration-300", isSidebarOpen && "rotate-180")} />
        </button>
      </aside>

      {/* ── Conteúdo principal ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg">
        {/*
          Tampa sólida fixa no topo (só mobile): cobre a status bar + a faixa de blur do iOS 26.
          Quando a página rola, o conteúdo some atrás dela em vez de ficar borrado por baixo do relógio.
        */}
        <div
          aria-hidden
          className="app-top-cover md:hidden fixed inset-x-0 top-0 z-40 bg-bg pointer-events-none"
        />
        <div className="app-top-pad flex-1 p-4 md:p-8 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
          <div className="mobile-page-header md:hidden" aria-label={`Cabeçalho ${pageHeader.title}`}>
            <OnfinLogo variant="horizontal" className="w-[150px] h-auto" />
            <div className="flex items-center gap-4 min-w-0">
              <span className="truncate text-[18px] font-medium tracking-tight text-[#A7A8B8]">{pageHeader.title}</span>
              <PageHeaderIcon className="h-8 w-8 shrink-0 text-[#F5F7FA]" strokeWidth={2.4} />
            </div>
          </div>
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>

      {/* ── Bottom Navigation (mobile apenas) ── */}
      <BottomNav />
    </div>
  );
}
