"use client"

import { Button } from "@/components/ui/button"
import { Calculator, Wallet, TrendingUp, Calendar } from "lucide-react"
import { LeadModal } from "@/components/lead-modal"
import { useState } from "react"

const DAILY_RATE_BYN = 100

export function SalaryBreakdown() {
  const [modalOpen, setModalOpen] = useState(false)
  const days = 30
  const earnings = DAILY_RATE_BYN * days
  const weeklyEarnings = DAILY_RATE_BYN * 7

  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Зарплата без обмана</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Прозрачный расчёт. Никаких скрытых комиссий или вычетов.
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-3xl mx-auto">
          {/* Daily Rate */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-muted-foreground mb-2">Дневная ставка</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl sm:text-6xl md:text-7xl font-bold gradient-text">
                {DAILY_RATE_BYN}
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">BYN</span>
            </div>
            <div className="text-muted-foreground mt-1">/ день</div>
          </div>

          {/* Calculator */}
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <div className="flex items-center gap-3 glass rounded-xl p-4 sm:p-5">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Смен в месяц</div>
                <div className="text-lg sm:text-xl font-bold text-foreground">{days} дней (полный месяц)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 glass rounded-xl p-4 sm:p-5">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Итого в месяц</div>
                <div className="text-xl sm:text-2xl font-bold gradient-text">{earnings.toLocaleString("ru-RU")} BYN</div>
              </div>
            </div>

            <div className="flex items-center gap-3 glass rounded-xl p-4 sm:p-5">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">В неделю</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground">{weeklyEarnings.toLocaleString("ru-RU")} BYN</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              className="text-lg px-8 h-14 sm:h-16 rounded-2xl glow-primary font-semibold"
              onClick={() => setModalOpen(true)}
            >
              Хочу такую зарплату
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mt-8 sm:mt-12">
          {[
            {
              icon: Calculator,
              title: "Честный расчёт",
              desc: `${DAILY_RATE_BYN} BYN за каждую смену. Никаких скрытых вычетов.`,
            },
            {
              icon: Wallet,
              title: "Стабильные выплаты",
              desc: "Выплаты 2 раза в месяц. Без задержек.",
            },
            {
              icon: TrendingUp,
              title: "Рост дохода",
              desc: "При переработках — оплата сверху. Премии за хорошую работу.",
            },
          ].map((benefit) => (
            <div key={benefit.title} className="glass rounded-xl p-4 sm:p-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 mb-3 sm:mb-4">
                <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <LeadModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  )
}
