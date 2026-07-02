import type { Metadata } from "next";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "On Finanças",
  description: "Gestão financeira pessoal com dashboard, movimentações, contas e cartões",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
