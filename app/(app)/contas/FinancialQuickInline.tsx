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

const payload = {
  id: crypto.randomUUID(),
  nome,
  tipo,
  logo_url: null,
  limite: tipo === "cartao" ? limite : null
}
        : {
            id: crypto.randomUUID(),
            nome,
            tipo: "cartao",
            logo_url: null,
            limite
          }

    const { error } = await supabase
      .from("financeiro_itens")
      .insert(payload)

    setLoading(false)

    if (!error) {
      setNome("")
      setLimite(0)
      onCreated?.()
    } else {
      console.error(error)
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

      {/* limite (só cartão) */}
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
