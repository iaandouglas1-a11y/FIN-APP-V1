import { getContasWithMovs } from "./contas";
import { getCartoesEFaturas } from "./cartoes";

export async function getContasEFaturas() {
  const contas = await getContasWithMovs();
  const cartoes = await getCartoesEFaturas();

  return { contas, cartoes };
}
