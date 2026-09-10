"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = {
  onCreated?: () => void
}

export function FinancialQuickInline({ onCreated }: Props) {
  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState<"conta" | "cartao">("conta")
  const [limite, setLimite] = useState<number>(0)
  const [loading, setLoading] = useState(false)

async function handleCreate() {
  if (!nome) return

  setLoading(true)

  const id = crypto.randomUUID()

  const isCartao = tipo === "cartao"

  // 1. NOVO MODELO (sempre)
  const insertNovo = supabase
    .from("financeiro_itens")
    .insert({
      id,
      nome,
      tipo,
      logo_url: null,
      limite: isCartao ? limite : null
    })

  // 2. LEGACY (compatibilidade)
  const insertLegacy = isCartao
    ? supabase.from("cartoes").insert({
        id,
        nome,
        limite,
        conta_id: null,
        logo_url: null
      })
    : supabase.from("contas").insert({
        id,
        nome,
        tipo,
        logo_url: null
      })

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    insertNovo,
    insertLegacy
  ])

  setLoading(false)

  if (!e1 && !e2) {
    setNome("")
    setLimite(0)
    onCreated?.()
  } else {
    console.error("Erro dual write:", e1 || e2)
  }
}
  return (
    <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-3">

      {/* nome */}
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da conta ou cartão"
        className="w-full bg-transparent text-white outline-none text-sm"
      />

      {/* tipo */}
      <div className="flex gap-2">
        <button
          onClick={() => setTipo("conta")}
          className={`px-3 py-1 rounded text-xs ${
            tipo === "conta"
              ? "bg-green-500/30 text-white"
              : "text-white/50"
          }`}
        >
          Conta
        </button>

        <button
          onClick={() => setTipo("cartao")}
          className={`px-3 py-1 rounded text-xs ${
            tipo === "cartao"
              ? "bg-blue-500/30 text-white"
              : "text-white/50"
          }`}
        >
          Cartão
        </button>
      </div>

      {/* limite (somente cartão) */}
      {tipo === "cartao" && (
        <input
          type="number"
          value={limite}
          onChange={(e) => setLimite(Number(e.target.value))}
          placeholder="Limite"
          className="w-full bg-transparent text-white outline-none text-sm"
        />
      )}

      {/* botão */}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full bg-green-500/20 text-green-300 text-sm py-2 rounded"
      >
        {loading ? "Salvando..." : "Criar"}
      </button>
    </div>
  )
}
