# Finanças MVP

## Estrutura

```txt
app/
  (app)/dashboard, movimentacoes, contas, cartoes, faturas
  (auth)/actions.ts
components/
lib/
types/
supabase/schema.sql
```

## Setup

1. Crie um projeto no Supabase e rode `supabase/schema.sql` no SQL Editor.
2. Ative Auth por email/senha.
3. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Rode `npm install` e `npm run dev`.

## Consultas-chave

Saldo de conta: soma movimentações realizadas com `conta_id`, receita positiva e despesa negativa.
Fatura: soma despesas com `fatura_id`.
DRE: agrupamento mensal por `data`, com `receitas - despesas`.
