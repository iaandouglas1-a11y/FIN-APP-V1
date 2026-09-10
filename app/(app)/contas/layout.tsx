"use client";

import React from "react";

export default function ContasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">
        Contas
      </h1>

      {children}
    </div>
  );
}
