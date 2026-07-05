"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Wallet, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui";

const subTabs = [
  { href: "/contas", label: "Contas", icon: Wallet },
  { href: "/contas/cartoes", label: "Cartões", icon: CreditCard },
];

export default function ContasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bancos e Contas"
        description="Gerencie seus saldos, instituições financeiras e cartões de crédito"
      />

      {/* Sub-navegação: Contas / Cartões */}
      <div className="flex gap-2 border-b border-slate-800/60 -mt-4">
        {subTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200",
                isActive
                  ? "border-[#5DA832] text-[#6fc23b]"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
