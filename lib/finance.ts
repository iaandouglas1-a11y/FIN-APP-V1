import type { Movimentacao } from "@/types/database";
export function signedValue(mov: Pick<Movimentacao, "tipo" | "valor">) { return mov.tipo === "receita" ? Number(mov.valor) : -Number(mov.valor); }
export function accountBalance(contaId: string, movs: Movimentacao[]) { return movs.filter((m) => m.conta_id === contaId && m.status === "realizado").reduce((sum, m) => sum + signedValue(m), 0); }
export function totalBalance(movs: Movimentacao[]) { return movs.filter((m) => m.conta_id && m.status === "realizado").reduce((sum, m) => sum + signedValue(m), 0); }
export function invoiceTotal(faturaId: string, movs: Movimentacao[]) { return movs.filter((m) => m.fatura_id === faturaId && m.tipo === "despesa").reduce((sum, m) => sum + Number(m.valor), 0); }
export function monthBounds(date = new Date()) { const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1)); const end = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)); return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }; }
