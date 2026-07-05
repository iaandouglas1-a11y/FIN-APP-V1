import { Receipt } from "lucide-react";

interface Props {
  cartaoNome: string;
  cartaoLogo?: string | null;
}

export default function FaturaAccordion({
  cartaoNome,
  cartaoLogo,
  ...props
}: Props) {

  return (
    <div className="flex items-center gap-3">
      
      {/* 🔥 LOGO / ÍCONE */}
      <div className={`h-10 w-10 rounded-lg overflow-hidden ${
        cartaoLogo
          ? ""
          : "bg-gradient-to-br from-[#5DA832]/30 to-[#5DA832]/10 flex items-center justify-center"
      }`}>
        {cartaoLogo ? (
          <img
            src={cartaoLogo}
            alt={cartaoNome}
            className="h-full w-full object-cover"
          />
        ) : (
          <Receipt className="h-5 w-5 text-[#5DA832]" />
        )}
      </div>

      {/* Nome */}
      <span className="font-semibold text-slate-200">
        {cartaoNome}
      </span>
    </div>
  );
}