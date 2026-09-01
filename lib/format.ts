export function currency(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }
export function dateBR(value: string) { 
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
