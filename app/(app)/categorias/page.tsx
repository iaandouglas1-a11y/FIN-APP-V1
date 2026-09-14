import { getCategorias } from "@/lib/queries";
import {
  Card,
  Button,
  Badge,
  EmptyState,
  IconChip,
} from "@/components/ui";
import { saveCategoria, deleteCategoria } from "@/app/(app)/actions";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { Tags, Plus, Trash2, FolderOpen } from "lucide-react";

export default async function CategoriasPage() {
  const categorias = await getCategorias();

  return (
    <div className="space-y-6">

      {/* HEADER PADRÃO IGUAL CONTAS */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white">
            Categorias
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie suas categorias financeiras
          </p>
        </div>

        <form action={saveCategoria}>
          <Button className="h-9 text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova categoria
          </Button>
        </form>
      </div>

      {/* CARD PRINCIPAL (MESMO PADRÃO CONTAS) */}
      <Card className="p-0 overflow-hidden">
        {/* HEADER INTERNO */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-surface-border/40">
          <div className="flex items-center gap-3">
            <Tags className="h-5 w-5 text-slate-400" />
            <div>
              <h3 className="font-semibold text-white">
                Categorias
              </h3>
              <p className="text-xs text-slate-500">
                {categorias.length} cadastradas
              </p>
            </div>
          </div>

          <Badge variant="info">{categorias.length}</Badge>
        </div>

        {/* EMPTY */}
        {categorias.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-10 w-10" />}
            title="Nenhuma categoria cadastrada"
            description="Crie sua primeira categoria para organizar suas movimentações"
          />
        ) : (
          <div className="divide-y divide-surface-border/40">
            {categorias.map((cat) => {
              const Icon = getCategoryIcon(cat.nome);
              const isReceita =
                cat.tipo?.toLowerCase() === "receita";

              return (
                <div
                  key={cat.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-surface-2/20 transition group"
                >
                  {/* LEFT SIDE (PADRÃO CONTAS) */}
                  <div className="flex items-center gap-4">
                    <IconChip
                      icon={Icon}
                      tone={isReceita ? "green" : "red"}
                      size={38}
                      iconSize={18}
                    />

                    <div className="flex flex-col">
                      <span className="text-slate-100 font-medium">
                        {cat.nome}
                      </span>

                      <span className="text-xs text-slate-500">
                        {isReceita ? "Receita" : "Despesa"}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT ACTION */}
                  <form action={deleteCategoria}>
                    <input type="hidden" name="id" value={cat.id} />

                    <button
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-rose-400"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
