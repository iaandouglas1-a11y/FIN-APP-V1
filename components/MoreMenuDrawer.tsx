"use client";

import {
  Receipt, Users, HandCoins, TrendingDown,
  TrendingUp, Tags, PiggyBank, StickyNote,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Link from "next/link";
import { BottomSheet, IconChip } from "./ui";
import type { IconTone } from "./ui";

interface MoreMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

// Módulos secundários acessíveis pelo botão "Mais", agrupados na ordem definida
// para o produto. Bancos permanece como atalho fixo na barra inferior.
type SecondaryNavItem = { href: string; label: string; icon: any; tone: IconTone };

const secondaryNavGroups: { label: string; items: SecondaryNavItem[] }[] = [
  {
    label: "Financeiro",
    items: [
      { href: "/investimentos", label: "Investimentos", icon: TrendingUp, tone: "purple" },
      { href: "/orcamento", label: "Orçamento", icon: PiggyBank, tone: "green" },
      { href: "/faturas", label: "Faturas", icon: Receipt, tone: "amber" },
      { href: "/dividas", label: "Dívidas", icon: TrendingDown, tone: "red" },
    ],
  },
  {
    label: "Profissional",
    items: [
      { href: "/honorarios", label: "Honorários", icon: HandCoins, tone: "green" },
      { href: "/clientes", label: "Clientes", icon: Users, tone: "blue" },
    ],
  },
  {
    label: "Sistema e diversos",
    items: [
      { href: "/notas", label: "Notas", icon: StickyNote, tone: "blue" },
      { href: "/categorias", label: "Categorias", icon: Tags, tone: "amber" },
    ],
  },
];

// Achatado, mantido para quem importa `secondaryNav` de fora (ex.: highlight
// de rota ativa em outros componentes).
const secondaryNav: SecondaryNavItem[] = secondaryNavGroups.flatMap((g) => g.items);

export function MoreMenuDrawer({ open, onClose }: MoreMenuDrawerProps) {
  const pathname = usePathname();

  return (
    <BottomSheet open={open} onClose={onClose} title="Mais opções">
      <div className="space-y-5 pb-2">
        {secondaryNavGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[11px] font-semibold text-ink-secondary mb-3 px-0.5">
              {group.label}
            </p>
            <div className="grid grid-cols-4 gap-y-5 gap-x-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                  >
                    <IconChip icon={Icon} tone={item.tone} size={48} iconSize={19} rounded="rounded-2xl" />
                    <span className={clsx(
                      "text-[11px] font-semibold text-center leading-tight",
                      isActive ? "text-[#8FCB5E]" : "text-ink-secondary"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

export { secondaryNav, secondaryNavGroups };
