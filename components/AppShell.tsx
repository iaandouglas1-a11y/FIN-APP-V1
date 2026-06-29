"use client";

import { useState } from "react";
import { 
  WalletCards, Menu, X, LayoutDashboard, ArrowUpRight, 
  CreditCard, Receipt, Wallet, Tags, LogOut, ChevronRight, Settings
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";

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
        { href: "/cartoes", label: "Meus Cartões", icon: CreditCard },
        { href: "/faturas", label: "Faturas", icon: Receipt },
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
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 to-[#0a0a0a] border-r border-slate-800/40">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800/40">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/40 group-hover:shadow-indigo-900/60 transition-all duration-300">
            <WalletCards className="h-6 w-6 text-white" />
          </div>
          <div className={clsx(
            "transition-all duration-300 overflow-hidden",
            !isSidebarOpen && "md:w-0 md:opacity-0"
          )}>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
              Gerenciador Pessoal
            </span>
            <p className="text-[10px] text-slate-500 font-medium">Controle Financeiro e Diversos</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className={clsx(
              "text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 mb-3 px-3 transition-all duration-300",
              !isSidebarOpen && "md:opacity-0 md:w-0"
            )}>
              {group.group}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group/nav relative overflow-hidden",
                      isActive 
                        ? "bg-gradient-to-r from-indigo-600/20 to-indigo-600/10 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-900/10" 
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent hover:border-slate-700/30"
                    )}
                  >
                    <Icon className={clsx(
                      "h-5 w-5 shrink-0 transition-all duration-200",
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover/nav:text-slate-300"
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

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/40 space-y-3">
        <button className={clsx(
          "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent hover:border-slate-700/30",
          !isSidebarOpen && "md:justify-center md:px-2"
        )}>
          <Settings className="h-5 w-5 shrink-0" />
          <span className={clsx(
            "text-sm font-medium transition-all duration-300",
            !isSidebarOpen && "md:opacity-0 md:w-0"
          )}>
            Configurações
          </span>
        </button>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-800/40">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0" />
          <div className={clsx(
            "flex flex-col transition-all duration-300 min-w-0",
            !isSidebarOpen && "md:opacity-0 md:w-0"
          )}>
            <span className="text-xs font-bold text-white truncate">Usuário</span>
            <span className="text-[10px] text-slate-500 truncate">Controle Pessoal</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/40 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700">
            <WalletCards className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">FINV4</span>
            <p className="text-[10px] text-slate-500">Finanças</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-all duration-200"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={clsx(
        "hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out z-40",
        isSidebarOpen ? "w-72" : "w-24"
      )}>
        <SidebarContent />
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 rounded-full p-1.5 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-900/20"
        >
          <ChevronRight className={clsx("h-4 w-4 transition-transform duration-300", isSidebarOpen && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#0a0a0a] to-slate-950/50">
        <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
