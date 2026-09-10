"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Item = {
  id: string
  nome: string
  tipo: "conta" | "cartao"
  limite?: number
}

type Props = {
  item: Item
}

export function EditarFinancialBtn({ item }: Props) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState(item.nome)
  const [limite, setLimite] = useState(item.limite || 0)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)

    const updates =
      item.tipo === "cartao"
        ? { nome, limite }
        : { nome }

    const { error } = await supabase
      .from("financeiro_itens")
      .update(updates)
      .eq("id", item.id)

    setLoading(false)

    if (!error) setOpen(false)
    else console.error(error)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-white/60 text-sm"
      >
        Editar
      </button>
    )
  }

  return (
    <div className="space-y-2">

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="bg-transparent text-white text-sm outline-none border-b border-white/20"
      />

      {item.tipo === "cartao" && (
        <input
          type="number"
          value={limite}
          onChange={(e) => setLimite(Number(e.target.value))}
          className="bg-transparent text-white text-sm outline-none border-b border-white/20"
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="text-white/40 text-xs"
        >
          Cancelar
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="text-green-400 text-xs"
        >
          {loading ? "..." : "Salvar"}
        </button>
      </div>
    </div>
  )
}
