import { getNotas } from "@/lib/queries";
import NotasBody from "./NotasBody";

export default async function NotasPage() {
  const notas = await getNotas();

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">Notas</h1>
      <NotasBody notas={notas} />
    </div>
  );
}
