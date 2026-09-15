"use client";

import {
  Receipt, Users, HandCoins, TrendingDown,
  TrendingUp, Tags, StickyNote,
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

// Módulos secundários acessíveis pelo botão "Mais" — grade 4 colunas,
// cada item com IconChip colorido (consistente com os esboços de tela).
const secondaryNav: { href: string; label: string; icon: any; tone: IconTone }[] = [
  { href: "/faturas", label: "Faturas", icon: Receipt, tone: "red" },
  { href: "/dividas", label: "Dívidas", icon: TrendingDown, tone: "amber" },
  { href: "/investimentos", label: "Investim.", icon: TrendingUp, tone: "purple" },
  { href: "/honorarios", label: "Honorários", icon: HandCoins, tone: "green" },
  { href: "/clientes", label: "Clientes", icon: Users, tone: "blue" },
  { href: "/categorias", label: "Categorias", icon: Tags, tone: "amber" },
  { href: "/notas", label: "Notas", icon: StickyNote, tone: "green" },
];

export function MoreMenuDrawer({ open, onClose }: MoreMenuDrawerProps) {
  const pathname = usePathname();

  return (
    <BottomSheet open={open} onClose={onClose} title="Mais opções">
      <div className="grid grid-cols-4 gap-y-5 gap-x-2 pb-2">
        {secondaryNav.map((item) => {
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
                "text-[10.5px] font-semibold text-center leading-tight",
                isActive ? "text-[#6fc23b]" : "text-ink-secondary"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </BottomSheet>
  );
}

export { secondaryNav };
