import {
  ShoppingCart, Utensils, Coffee, Beer, Wine, Pizza,
  Car, Fuel, Bus, Bike, Plane, ParkingCircle,
  Home, Building2, Wrench, Lightbulb, Droplet, Wifi, Smartphone, Tv,
  HeartPulse, Pill, Dumbbell, Stethoscope,
  GraduationCap, BookOpen,
  Gamepad2, Film, Music, Ticket,
  Shirt, ShoppingBag,
  PawPrint, Gift, Baby,
  Landmark, Banknote, TrendingUp, PiggyBank, CreditCard, Receipt,
  Briefcase, Scissors, Users, HandCoins, HandHeart,
  Tag,
  type LucideIcon,
} from "lucide-react";

interface IconRule {
  keywords: string[];
  icon: LucideIcon;
}

// Regras avaliadas em ordem — a primeira palavra-chave encontrada no nome vence.
const rules: IconRule[] = [
  { keywords: ["mercado", "supermercado", "hortifruti", "feira", "acougue", "hortifruiti"], icon: ShoppingCart },
  { keywords: ["restaurante", "alimentacao", "comida", "lanche", "ifood", "delivery", "almoco", "jantar"], icon: Utensils },
  { keywords: ["cafe", "cafeteria", "padaria"], icon: Coffee },
  { keywords: ["bebida", "chopp", "cerveja", "bar", "balada", "drink"], icon: Beer },
  { keywords: ["vinho", "adega"], icon: Wine },
  { keywords: ["pizza", "pizzaria"], icon: Pizza },
  { keywords: ["combustivel", "gasolina", "posto", "etanol", "alcool"], icon: Fuel },
  { keywords: ["estacionamento", "zona azul"], icon: ParkingCircle },
  { keywords: ["uber", "onibus", "metro", "transporte publico", "taxi", "99"], icon: Bus },
  { keywords: ["bicicleta", "bike"], icon: Bike },
  { keywords: ["carro", "veiculo", "manutencao veicular", "oficina", "revisao", "pneu"], icon: Car },
  { keywords: ["viagem", "passagem", "aereo", "hospedagem", "hotel", "pousada"], icon: Plane },
  { keywords: ["aluguel", "condominio", "moradia"], icon: Home },
  { keywords: ["imovel", "predio", "obra", "reforma", "construcao"], icon: Building2 },
  { keywords: ["manutencao", "reparo", "conserto", "encanador", "eletricista"], icon: Wrench },
  { keywords: ["energia", "luz", "eletricidade"], icon: Lightbulb },
  { keywords: ["agua", "saneamento", "esgoto"], icon: Droplet },
  { keywords: ["internet", "wifi", "banda larga"], icon: Wifi },
  { keywords: ["telefone", "celular", "fone", "linha movel"], icon: Smartphone },
  { keywords: ["tv", "streaming", "netflix", "assinatura", "prime video", "disney"], icon: Tv },
  { keywords: ["saude", "medico", "hospital", "consulta", "plano de saude", "convenio"], icon: HeartPulse },
  { keywords: ["farmacia", "remedio", "medicamento"], icon: Pill },
  { keywords: ["academia", "esporte", "ginastica", "musculacao", "personal"], icon: Dumbbell },
  { keywords: ["exame", "clinica", "laboratorio", "dentista"], icon: Stethoscope },
  { keywords: ["educacao", "faculdade", "curso", "escola", "universidade", "mensalidade"], icon: GraduationCap },
  { keywords: ["livro", "livraria", "material escolar"], icon: BookOpen },
  { keywords: ["jogo", "game", "videogame"], icon: Gamepad2 },
  { keywords: ["cinema", "filme"], icon: Film },
  { keywords: ["musica", "show", "instrumento"], icon: Music },
  { keywords: ["lazer", "ingresso", "evento", "passeio", "parque"], icon: Ticket },
  { keywords: ["roupa", "vestuario", "moda", "calcado", "sapato"], icon: Shirt },
  { keywords: ["loja", "shopping", "compras"], icon: ShoppingBag },
  { keywords: ["pet", "cachorro", "gato", "veterinario", "racao"], icon: PawPrint },
  { keywords: ["presente", "aniversario"], icon: Gift },
  { keywords: ["filho", "crianca", "bebe", "infantil"], icon: Baby },
  { keywords: ["investimento", "aplicacao", "renda fixa", "acoes", "bolsa", "tesouro"], icon: Landmark },
  { keywords: ["poupanca", "reserva de emergencia"], icon: PiggyBank },
  { keywords: ["salario", "pagamento", "pro-labore", "prolabore", "holerite"], icon: Banknote },
  { keywords: ["receita", "venda", "faturamento", "honorario"], icon: TrendingUp },
  { keywords: ["cartao", "fatura", "anuidade"], icon: CreditCard },
  { keywords: ["imposto", "taxa", "tributo", "irpj", "iss", "das", "inss", "csll"], icon: Receipt },
  { keywords: ["doacao", "caridade", "dizimo"], icon: HandHeart },
  { keywords: ["trabalho", "servico", "freelance", "consultoria", "projeto"], icon: Briefcase },
  { keywords: ["cabelo", "salao de beleza", "estetica", "barbeiro", "manicure"], icon: Scissors },
  { keywords: ["familia", "social", "amigos"], icon: Users },
  { keywords: ["outros", "diversos", "dinheiro"], icon: HandCoins },
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Retorna o ícone (lucide-react) mais relacionado ao nome da categoria,
 * com base em correspondência de palavras-chave. Cai para um ícone
 * genérico (Tag) quando nenhuma regra corresponde.
 */
export function getCategoryIcon(nome: string): LucideIcon {
  const n = normalize(nome || "");
  for (const rule of rules) {
    if (rule.keywords.some((k) => n.includes(normalize(k)))) {
      return rule.icon;
    }
  }
  return Tag;
}
