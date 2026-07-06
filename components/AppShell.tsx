"use client";

import { useState } from "react";
import { 
  Menu, X, LayoutDashboard, ArrowUpRight, 
  Receipt, Wallet, Tags, ChevronRight, ListChecks, Users, TrendingDown, TrendingUp, HandCoins
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";
import Image from "next/image";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { 
      group: "Principal", 
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/movimentacoes", label: "Movimentações", icon: ArrowUpRight },
      ]
    },
    { 
      group: "Gestão", 
      items: [
        { href: "/contas", label: "Bancos e Contas", icon: Wallet },
        { href: "/faturas", label: "Faturas", icon: Receipt },
        { href: "/listas", label: "Listas", icon: ListChecks },
        { href: "/clientes", label: "Acessos Clientes", icon: Users },
        { href: "/honorarios", label: "Honorários", icon: HandCoins },
        { href: "/dividas", label: "Dívidas", icon: TrendingDown },
        { href: "/investimentos", label: "Investimentos", icon: TrendingUp },
      ]
    },
    { 
      group: "Configurações", 
      items: [
        { href: "/categorias", label: "Categorias", icon: Tags },
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0D2340] border-r border-[#142d52]/80">
      <div className="p-4 border-b border-[#142d52]/80">
        <div className={clsx(
          "flex items-center gap-3 group cursor-pointer",
          !isSidebarOpen && "md:justify-center md:gap-0"
        )}>
          <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0">
            <Image src="/icon-512.png" alt="On Finanças" width={40} height={40} className="rounded-xl" />
          </div>
          <div className={clsx(
            "transition-all duration-300 overflow-hidden",
            !isSidebarOpen && "md:w-0 md:opacity-0"
          )}>
            <span className="text-base font-bold text-white tracking-tight">On Finanças</span>
            <p className="text-[10px] text-[#5DA832]/80 font-medium">Gestão Financeira</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className={clsx(
              "text-[10px] font-black uppercase tracking-[0.15em] text-[#5DA832]/50 mb-3 px-3 transition-all duration-300",
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
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group/nav relative overflow-hidden",
                      !isSidebarOpen && "md:justify-center md:px-0 md:gap-0",
                      isActive 
                        ? "bg-[#5DA832]/15 text-[#6fc23b] border border-[#5DA832]/30" 
                        : "text-slate-400 hover:bg-[#142d52]/60 hover:text-slate-200 border border-transparent hover:border-[#1e3a66]/40"
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
    <div className="min-h-screen bg-[#091829] flex">
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0D2340]/95 backdrop-blur-xl border-b border-[#142d52]/80 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0">
            <Image src="/icon-512.png" alt="On Finanças" width={36} height={36} className="rounded-lg" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">On Finanças</span>
            <p className="text-[10px] text-[#5DA832]/70">Gestão Financeira</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-all duration-200"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <aside className={clsx(
        "hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-40",
        isSidebarOpen ? "w-72" : "w-24"
      )}>
        <SidebarContent />
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 bg-[#0D2340] border border-[#142d52]/80 text-slate-400 hover:text-[#5DA832] rounded-full p-1.5 transition-all duration-200"
        >
          <ChevronRight className={clsx("h-4 w-4 transition-transform duration-300", isSidebarOpen && "rotate-180")} />
        </button>
      </aside>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-72 h-full animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-slate-800/60 rounded-lg transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 bg-[#091829]">
        <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
