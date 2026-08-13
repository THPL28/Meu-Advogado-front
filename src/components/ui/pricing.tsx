"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = `Choose the plan that works for you
All plans include access to our platform, lead generation tools, and dedicated support.`,
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="container py-10 mx-auto px-4">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          {title}
        </h2>
        <p className="text-muted-foreground/90 text-base whitespace-pre-line max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center mb-10">
        <label className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative"
            />
          </Label>
        </label>
        <span className="ml-3 font-semibold text-sm text-muted-foreground">
          Faturamento Anual <span className="text-emerald-600">(Economize 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 30, opacity: 0.8 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -12 : 0,
                    opacity: 1,
                    scale: plan.isPopular ? 1.02 : 1.0,
                  }
                : { opacity: 1, y: 0 }
            }
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 25,
            }}
            className={cn(
              `rounded-3xl border p-6 bg-card text-center flex flex-col justify-between relative shadow-xs`,
              plan.isPopular ? "border-emerald-500 border-2 shadow-md" : "border-border/80"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-emerald-600 text-white py-1 px-3 rounded-bl-2xl rounded-tr-3xl flex items-center shadow-xs">
                <Star className="text-white h-3.5 w-3.5 fill-current" />
                <span className="ml-1 font-sans font-semibold text-xs tracking-wider uppercase">
                  Recomendado
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className="text-lg font-bold text-foreground text-left">
                {plan.name}
              </p>
              <div className="mt-4 flex items-baseline justify-start gap-x-1">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    formatter={(value) => `R$ ${value}`}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className="text-sm font-medium text-muted-foreground/90">
                    / {plan.period}
                  </span>
                )}
              </div>

              <p className="text-xs leading-5 text-muted-foreground/90 text-left mt-1">
                {isMonthly ? "faturamento mensal" : "faturamento anual"}
              </p>

              <ul className="mt-6 gap-3 flex flex-col text-sm text-muted-foreground">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-left text-xs sm:text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-6 border-border/50" />

              <a
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-sm font-bold tracking-wide rounded-2xl py-3 cursor-pointer transition-all",
                  plan.isPopular
                    ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:text-white"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                {plan.buttonText}
              </a>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground/90">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
