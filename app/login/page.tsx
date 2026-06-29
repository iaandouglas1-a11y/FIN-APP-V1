import { login, signup } from "@/app/(auth)/actions";
import { Button, Card, Input, PageHeader } from "@/components/ui";
import { WalletCards, ArrowRight } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a0a0a] via-slate-950 to-[#0a0a0a]">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-900/40">
              <WalletCards className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FINV4</h1>
          <p className="text-slate-400">Seu controle financeiro inteligente</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-slate-400 text-sm">Acesse sua gestão financeira pessoal</p>
          </div>

          {/* Error Message */}
          {params.error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-rose-400 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-rose-400">{params.error}</p>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">
                Email
              </label>
              <Input 
                name="email" 
                type="email" 
                placeholder="seu@email.com" 
                required 
                className="h-12"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">
                Senha
              </label>
              <Input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                minLength={6} 
                required 
                className="h-12"
              />
            </div>

            <Button 
              formAction={login} 
              className="w-full h-12 text-base font-semibold mt-6 flex items-center justify-center gap-2"
            >
              Entrar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800/40" />
            <span className="text-xs text-slate-500 font-medium">ou</span>
            <div className="flex-1 h-px bg-slate-800/40" />
          </div>

          {/* Signup Button */}
          <button 
            formAction={signup} 
            className="w-full h-12 rounded-xl border border-slate-700/60 text-slate-300 font-semibold hover:bg-slate-800/40 hover:border-slate-600/60 hover:text-slate-200 transition-all duration-200 text-base"
          >
            Criar nova conta
          </button>

          {/* Footer Text */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Ao entrar, você concorda com nossos termos de serviço
          </p>
        </Card>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: "Seguro", desc: "Dados criptografados" },
            { label: "Rápido", desc: "Acesso instantâneo" },
            { label: "Simples", desc: "Fácil de usar" }
          ].map((feature) => (
            <div key={feature.label} className="text-center">
              <p className="text-xs font-semibold text-slate-300 mb-1">{feature.label}</p>
              <p className="text-[10px] text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
