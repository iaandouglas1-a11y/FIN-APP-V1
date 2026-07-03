import { saveCliente, deleteCliente } from "@/app/(app)/actions_clientes";
import { Card, Button, Input, PageHeader, FormGroup, EmptyState } from "@/components/ui";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import type { Cliente } from "@/types/database";
import { Users, Plus, Trash2, ChevronDown, Eye, EyeOff } from "lucide-react";
import ClienteRow from "./ClienteRow";

async function getClientes(): Promise<Cliente[]> {
  const s = await createServerSupabaseClient();
  const { data, error } = await (s.from("clientes") as any)
    .select("*")
    .order("nome", { ascending: true });
  if (error) throw error;
  return data || [];
}

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Acessos Clientes"
        description="Gerencie as informações de acesso dos clientes da On Contabilidade"
      />

      {/* Formulário de inserção */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Novo Cliente</span>
        </div>
        <form action={saveCliente} className="relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <FormGroup label="Nome">
              <Input name="nome" placeholder="Nome completo" required className="h-9 text-sm" />
            </FormGroup>
            <FormGroup label="CPF">
              <Input name="cpf" placeholder="000.000.000-00" className="h-9 text-sm" />
            </FormGroup>
            <FormGroup label="CNPJ">
              <Input name="cnpj" placeholder="00.000.000/0000-00" className="h-9 text-sm" />
            </FormGroup>
            <FormGroup label="Senha Gov">
              <Input name="senha_gov" type="password" placeholder="••••••••" className="h-9 text-sm" />
            </FormGroup>
          </div>
          <Button type="submit" className="h-9 text-sm font-semibold inline-flex items-center justify-center">
            <Plus className="h-4 w-4 mr-1.5" />
            Cadastrar Cliente
          </Button>
        </form>
      </Card>

      {/* Lista de clientes */}
      <Card className="p-0 overflow-hidden border-slate-800/60">
        <div className="px-4 py-3 border-b border-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#5DA832]" />
            <h3 className="font-semibold text-white text-sm">Clientes Cadastrados</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#5DA832]/10 text-[#5DA832] border border-[#5DA832]/30">
            {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
          </span>
        </div>

        {clientes.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="Nenhum cliente cadastrado"
            description="Adicione o primeiro cliente usando o formulário acima"
          />
        ) : (
          <div className="divide-y divide-slate-800/40">
            {clientes.map((cliente) => (
              <ClienteRow key={cliente.id} cliente={cliente} deleteCliente={deleteCliente} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
