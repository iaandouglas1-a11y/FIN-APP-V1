import { getCategorias } from "@/lib/queries";
import { Card, Button, Input, Select, Badge, PageHeader, FormGroup, EmptyState } from "@/components/ui";
import { saveCategoria, deleteCategoria } from "@/app/(app)/actions";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { Tags, Plus, Trash2, FolderOpen, AlertCircle } from "lucide-react";

export default async function CategoriasPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const categorias = await getCategorias();

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {sp.error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-400">Erro ao processar</p>
            <p className="text-sm text-rose-300 mt-1">{sp.error}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <PageHeader 
        title="Categorias"
        description="Organize suas movimentações por tipo de gasto ou receita"
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Sidebar: Formulário */}
        <aside>
          <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden sticky top-8">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-2 mb-6 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
              <Plus className="h-4 w-4" />
              <span>Nova Categoria</span>
            </div>
            
            <form action={saveCategoria} className="space-y-4 relative z-10">
              <FormGroup label="Nome da Categoria">
                <Input 
                  name="nome" 
                  placeholder="Ex: Alimentação, Lazer, Saúde..." 
                  required 
                  className="h-9"
                />
              </FormGroup>

              <FormGroup label="Tipo">
                <Select name="tipo" required className="h-9">
                  <option value="">Selecione o tipo...</option>
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </Select>
              </FormGroup>
              
              <Button type="submit" className="w-full h-9 text-sm font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Criar Categoria
              </Button>
            </form>

            <p className="text-xs text-slate-500 mt-6 pt-4 border-t border-slate-800/40 relative z-10">
              As categorias ajudam a organizar e analisar suas movimentações financeiras.
            </p>
          </Card>
        </aside>

        {/* Main: Lista de Categorias */}
        <main>
          <Card className="p-0 overflow-hidden border-slate-800/60">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900/50 to-slate-950/50 border-b border-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800/40">
                  <Tags className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Categorias Cadastradas</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Gerencie suas categorias de movimentação</p>
                </div>
              </div>
              <Badge variant="info" className="text-sm font-semibold">
                {categorias.length} total
              </Badge>
            </div>

            {/* Content */}
            <div className="divide-y divide-slate-800/40">
              {categorias.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="h-12 w-12" />}
                  title="Nenhuma categoria encontrada"
                  description="Comece criando uma categoria ao lado para organizar suas movimentações"
                />
              ) : (
                categorias.map((cat) => {
                  const CatIcon = getCategoryIcon(cat.nome);

                  // ✅ NORMALIZAÇÃO CENTRAL (melhor prática)
                  const isReceita = cat.tipo?.toLowerCase() === "receita";

                  return (
                    <div 
                      key={cat.id} 
                      className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isReceita
                            ? "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25"
                            : "bg-rose-500/15 text-rose-400 group-hover:bg-rose-500/25"
                        }`}>
                          <CatIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-slate-200 font-semibold text-base">{cat.nome}</span>
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">{cat.tipo}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={isReceita ? "success" : "error"} className="text-[10px]">
                          {cat.tipo}
                        </Badge>
                        <form action={deleteCategoria}>
                          <input type="hidden" name="id" value={cat.id} />
                          <button 
                            type="submit"
                            className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200 group/btn"
                            title="Deletar categoria"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Info Box */}
          {categorias.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-slate-800/20 border border-slate-800/40">
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-slate-300">💡 Dica:</span> Você tem <span className="font-bold text-[#5DA832]">{categorias.length}</span> categorias cadastradas. Use-as para filtrar e analisar suas movimentações.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}