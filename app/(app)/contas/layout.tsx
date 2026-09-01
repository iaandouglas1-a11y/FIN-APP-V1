"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Wallet, CreditCard } from "lucide-react";

const subTabs = [
  { href: "/contas", label: "Contas", icon: Wallet },
  { href: "/contas/cartoes", label: "Cartões", icon: CreditCard },
];

export default function ContasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">Contas</h1>

      {/* Sub-navegação: Contas / Cartões — segmented control, estilo iOS */}
      <div className="flex bg-surface border border-surface-border/60 rounded-xl p-1 gap-0.5">
        {subTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-semibold rounded-lg transition-all duration-150",
                isActive ? "bg-[#5DA832] text-[#06111F]" : "text-ink-secondary hover:text-ink-primary"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
