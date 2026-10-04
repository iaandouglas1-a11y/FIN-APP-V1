"use client";

import { ArrowUpRight, ArrowDownLeft, Repeat, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomSheet, IconChip } from "./ui";
import type { IconTone } from "./ui";

interface QuickActionSheetProps {
  open: boolean;
  onClose: () => void;
}

const actions: { label: string; href: string; icon: any; tone: IconTone }[] = [
  { label: "Nova receita", href: "/movimentacoes?tipo=receita#lancamento", icon: ArrowUpRight, tone: "green" },
  { label: "Nova despesa", href: "/movimentacoes?tipo=despesa#lancamento", icon: ArrowDownLeft, tone: "red" },
  { label: "Transferir entre contas", href: "/movimentacoes?acao=transferencia#lancamento", icon: Repeat, tone: "gray" },
  { label: "Pagar fatura", href: "/faturas", icon: Receipt, tone: "amber" },
];

export function QuickActionSheet({ open, onClose }: QuickActionSheetProps) {
  const router = useRouter();

  return (
    <BottomSheet open={open} onClose={onClose} title="Ação rápida">
      <div className="grid grid-cols-2 gap-3 pb-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => {
              router.push(a.href);
              onClose();
            }}
            className="flex flex-col items-start gap-3 p-4 rounded-xl bg-surface-2/60 border border-surface-border/50 active:scale-[0.97] transition-all text-left"
          >
            <IconChip icon={a.icon} tone={a.tone} size={38} iconSize={17} />
            <span className="text-[13px] font-semibold text-ink-primary leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
