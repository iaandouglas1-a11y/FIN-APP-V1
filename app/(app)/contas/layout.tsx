"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Wallet, CreditCard } from "lucide-react";

export default function ContasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">Contas</h

      {children}
    </div>
  );
}
