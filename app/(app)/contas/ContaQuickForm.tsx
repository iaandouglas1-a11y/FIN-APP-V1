"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createConta } from "@/app/(app)/contas/actions_contas"

export function ContaQuickForm() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    await createConta({
      nome,
    })

    setOpen(false)
    setNome("")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#5DA832] text-white px-4 py-2 rounded-xl text-sm font-medium"
      >
        Nova conta
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Nova conta</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da conta"
              className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#142d52]"
            />

            <button
              type="submit"
              className="w-full bg-[#5DA832] text-white py-3 rounded-xl"
            >
              Criar conta
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
