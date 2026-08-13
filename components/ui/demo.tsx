"use client";

import { Pricing } from "@/components/blocks/pricing";

const demoPlans = [
  {
    name: "Plano Básico",
    price: "0",
    yearlyPrice: "0",
    period: "mês",
    features: [
      "5 propostas mensais",
      "2 propostas simultâneas",
      "2 convites diretos por mês",
      "Acesso ao marketplace público",
      "Suporte via comunidade",
    ],
    description: "Ideal para advogados iniciantes testarem a plataforma",
    buttonText: "Mudar para Básico",
    href: "#",
    isPopular: false,
  },
  {
    name: "Plano Pro",
    price: "99",
    yearlyPrice: "79",
    period: "mês",
    features: [
      "25 propostas mensais",
      "5 propostas simultâneas",
      "10 convites diretos por mês",
      "Destaque nas buscas públicas",
      "Selo Advogado Verificado Pro",
      "Suporte prioritário 24/7",
    ],
    description: "Ideal para advogados em crescimento e escritórios médios",
    buttonText: "Mudar para Pro",
    href: "#",
    isPopular: true,
  },
  {
    name: "Plano Premium",
    price: "249",
    yearlyPrice: "199",
    period: "mês",
    features: [
      "Propostas ilimitadas",
      "Propostas simultâneas ilimitadas",
      "Convites ilimitados",
      "Prioridade máxima em buscas",
      "Selo Exclusive no Perfil",
      "Relatórios de taxa de conversão",
      "Atendimento por gerente dedicado",
    ],
    description: "Para bancas e escritórios de alta demanda",
    buttonText: "Mudar para Premium",
    href: "#",
    isPopular: false,
  },
];

function PricingBasic() {
  return (
    <div className="h-[800px] overflow-y-auto rounded-lg">
      <Pricing 
        plans={demoPlans}
        title="Planos e Assinaturas Transparentes"
        description={`Escolha o plano ideal para alavancar sua captação de clientes jurídicos.
Todos os planos incluem acesso completo ao marketplace de demandas do LWork.`}
      />
    </div>
  );
}

export { PricingBasic };
