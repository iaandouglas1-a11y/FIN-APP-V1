import { saveFatura } from "@/app/(app)/actions";
import { Button, Card, Input, Select, PageHeader, FormGroup } from "@/components/ui";
import { invoiceTotal } from "@/lib/finance";
import { getCartoesEFaturas, getContasWithMovs, getCategorias } from "@/lib/queries";
import { Receipt, Plus } from "lucide-react";
import FaturaAccordion from "./FaturaAccordion";

export default async function FaturasPage() {
  const [{ cartoes, faturas, movimentacoes }, contasData, categorias] = await Promise.all([
    getCartoesEFaturas(),
    getContasWithMovs(),
    getCategorias(),
  ]);

  const contas = contasData.contas.map((c) => ({
    id: c.id,
    nome: c.nome,
  }));

  const today = new Date();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faturas"
        description="Controle o fechamento e vencimento de seus cartões de crédito"
      />

      {/* Nova Fatura */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Criar Nova Fatura</span>
        </div>

        <form action={saveFatura} className="flex flex-wrap items-end gap-2 relative z-10">
          <div className="flex-1 min-w-[140px]">
            <Select name="cartao_id" required className="h-9 text-sm">
              <option value="">Selecione o Cartão</option>
              {cartoes.map((c) => (
                <option key={c.id} value={c.id}>
                  {(c as any).nome}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-36 shrink-0">
            <FormGroup label="Fechamento">
              <Input name="data_fechamento" type="date" required className="h-9 w-full text-sm" />
            </FormGroup>
          </div>

          <div className="w-36 shrink-0">
            <FormGroup label="Vencimento">
              <Input name="data_vencimento" type="date" required className="h-9 w-full text-sm" />
            </FormGroup>
          </div>

          <div className="flex-1 min-w-[140px]">
            <FormGroup label="Observação (opcional)">
              <Input name="observacao" placeholder="Ex: Fatura de junho..." className="h-9 text-sm" />
            </FormGroup>
          </div>

          <Button type="submit" className="h-9 px-5 mb-[1px]">
            <Plus className="h-4 w-4 mr-1.5" />
            Criar
          </Button>
        </form>
      </Card>

      {/* Lista de Faturas */}
      <div className="space-y-3">
        {faturas.length === 0 ? (
          <Card className="text-center py-16 border-slate-800/60">
            <Receipt className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-300 mb-2">
              Nenhuma fatura registrada
            </h3>
            <p className="text-slate-500 text-sm">
              Crie uma fatura para seus cartões acima
            </p>
          </Card>
        ) : (
          (faturas as any[]).map((f) => {
            const card = (cartoes as any[]).find((c) => c.id === f.cartao_id);

            const expenses = (movimentacoes as any[]).filter(
              (m) => m.fatura_id === f.id
            );

            const total = invoiceTotal(f.id, movimentacoes);

            const pago = f.pago === true;
            const venc = new Date(f.data_vencimento);

            const isOverdue = venc < today && !pago;

            const isDue =
              !pago &&
              Math.abs(venc.getTime() - today.getTime()) <
                7 * 24 * 60 * 60 * 1000;

            return (
              <FaturaAccordion
                key={f.id}
                faturaId={f.id}
                cartaoId={f.cartao_id}
                cartaoNome={card?.nome ?? "Cartão"}
                cartaoLogo={card?.logo_url ?? null}
                dataFechamento={f.data_fechamento}
                dataVencimento={f.data_vencimento}
                pago={pago}
                pagoEm={f.pago_em ?? null}
                observacao={f.observacao ?? null}
                total={total}
                isOverdue={isOverdue}
                isDue={isDue}
                expenses={expenses}
                contas={contas}
                categorias={categorias}
                cartoes={cartoes.map((c: any) => ({ id: c.id, nome: c.nome }))}
                faturas={faturas.map((f: any) => ({ id: f.id, data_vencimento: f.data_vencimento }))}
              />
            );
          })
        )}
      </div>
    </div>
  );
}