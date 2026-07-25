"use client";

import {
  ListChecks, Users, HandCoins, TrendingDown,
  TrendingUp, Tags, X
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";
import Image from "next/image";

interface MoreMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

// Módulos secundários agrupados (acessíveis pelo botão "Mais")
const secondaryNav = [
  {
    group: "Gestão",
    items: [
      { href: "/listas", label: "Listas", icon: ListChecks },
      { href: "/clientes", label: "Acessos Clientes", icon: Users },
      { href: "/honorarios", label: "Honorários", icon: HandCoins },
      { href: "/dividas", label: "Dívidas", icon: TrendingDown },
      { href: "/investimentos", label: "Investimentos", icon: TrendingUp },
    ],
  },
  {
    group: "Configurações",
    items: [{ href: "/categorias", label: "Categorias", icon: Tags }],
  },
];

export function MoreMenuDrawer({ open, onClose }: MoreMenuDrawerProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer painel */}
      <div className="absolute bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 animate-in slide-in-from-bottom duration-300">
        <div className="mx-3 mb-3 bg-[#0D2340] border border-[#142d52]/80 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header do drawer */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#142d52]/60">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/icon-512.png"
                  alt="On Finanças"
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
              </div>
              <span className="text-sm font-bold text-white">
                On Finanças
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#142d52]/60 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Lista de módulos */}
          <div className="px-3 py-3 max-h-[60vh] overflow-y-auto space-y-4">
            {secondaryNav.map((group) => (
              <div key={group.group}>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5DA832]/50 mb-2 px-2">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-[#5DA832]/15 text-[#6fc23b] border border-[#5DA832]/30"
                            : "text-slate-400 hover:bg-[#142d52]/60 hover:text-slate-200 border border-transparent"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { secondaryNav };
