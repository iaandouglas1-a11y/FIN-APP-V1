import { saveConta } from "@/app/(app)/actions";
import { Card, Button, Input, Select, FormGroup } from "@/components/ui";
import { currency } from "@/lib/format";
import { accountBalance } from "@/lib/finance";
import { getContasWithMovs } from "@/lib/queries";
import { Wallet, Landmark, PiggyBank, Banknote, Plus } from "lucide-react";
import EditarContaBtn from "./EditarContaBtn";

export default async function ContasPage() {
  const { contas, movimentacoes } = await getContasWithMovs();

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "poupanca": return <PiggyBank className="h-6 w-6" />;
      case "investimento": return <Landmark className="h-6 w-6" />;
      case "dinheiro": return <Banknote className="h-6 w-6" />;
      default: return <Wallet className="h-6 w-6" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "poupanca": return "Poupança";
      case "investimento": return "Investimento";
      case "dinheiro": return "Dinheiro";
      default: return "Conta Corrente";
    }
  };

  return (
    <div className="space-y-8">
      {/* Nova Conta */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-2 mb-6 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Adicionar Nova Conta</span>
        </div>

        <form action={saveConta} className="grid gap-4 sm:grid-cols-[1fr_200px_auto] relative z-10">
          <FormGroup>
            <Input 
              name="nome" 
              placeholder="Nome da conta (Ex: Nubank, Bradesco...)" 
              required 
              className="h-9"
            />
          </FormGroup>

          <FormGroup>
            <Select name="tipo" defaultValue="corrente" className="h-9">
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="investimento">Investimento</option>
              <option value="dinheiro">Dinheiro</option>
            </Select>
          </FormGroup>

          <div className="flex items-end">
            <Button type="submit" className="h-9 px-5">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </form>
      </Card>

      {/* Grid de Contas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contas.map((conta) => {
          const balance = accountBalance(conta.id, movimentacoes);

          return (
            <Card 
              key={conta.id} 
              className="group relative overflow-hidden border-slate-800/60 hover:border-[#5DA832]/40 transition-all duration-300 flex flex-col"
            >
              {/* Background */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5DA832]/10 blur-3xl group-hover:bg-[#5DA832]/15 transition-all duration-300" />
              <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-slate-600/5 blur-3xl" />

              {/* Header */}
              <div className="flex items-start justify-between mb-6 relative z-10">
                
                {/* 🔥 LOGO / ÍCONE AJUSTADO */}
                <div className={`h-12 w-12 rounded-xl overflow-hidden transition-all duration-300 ${
                  conta.logo_url
                    ? "bg-transparent"
                    : "bg-gradient-to-br from-[#5DA832]/15 to-[#5DA832]/5 text-[#5DA832] flex items-center justify-center"
                }`}>
                  {conta.logo_url ? (
                    <img
                      src={conta.logo_url}
                      alt={conta.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getIcon(conta.tipo)
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">
                    {getTypeLabel(conta.tipo)}
                  </p>
                  <p className="text-sm font-bold text-slate-200 mt-1">
                    {conta.nome}
                  </p>
                </div>
              </div>

              {/* Saldo */}
              <div className="mt-auto relative z-10">
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-2">
                  Saldo Atual
                </p>
                <p className={`text-3xl font-bold tracking-tight ${
                  balance >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {currency(balance)}
                </p>
              </div>

              <div className="my-6 h-px bg-slate-800/40 relative z-10" />

              <div className="relative z-10">
                <EditarContaBtn
                  id={conta.id}
                  nome={conta.nome}
                  tipo={conta.tipo}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {contas.length === 0 && (
        <Card className="text-center py-16 border-slate-800/60">
          <Wallet className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            Nenhuma conta registrada
          </h3>
          <p className="text-slate-500 mb-6">
            Comece adicionando uma conta para rastrear seus saldos
          </p>
          <Button variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Conta
          </Button>
        </Card>
      )}
    </div>
  );
}
