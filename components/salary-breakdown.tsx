"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Calculator, Wallet, TrendingUp, Calendar, Home, UtensilsCrossed, Sparkles } from "lucide-react"
import { LeadModal } from "@/components/lead-modal"

const DAILY_RATE_BYN = 100
// Надбавка за смену при работе с переработками
const OVERTIME_BONUS_BYN = 25
// Сколько в среднем в месяц тратил бы вахтовик на жильё и питание (BYN),
// если бы снимал сам — это и есть экономия, т.к. у нас всё бесплатно.
const HOUSING_COST_BYN = 650
const FOOD_COST_BYN = 550

// Плавная анимация числа при изменении значения
function useAnimatedNumber(target: number, duration = 500) {
  const [value, setValue] = useState(target)
  const startRef = useRef(target)
  const fromRef = useRef(target)

  useEffect(() => {
    fromRef.current = startRef.current
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(fromRef.current + (target - fromRef.current) * eased)
      setValue(next)
      startRef.current = next
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

export function SalaryBreakdown() {
  const [modalOpen, setModalOpen] = useState(false)
  const [days, setDays] = useState(30)
  const [overtime, setOvertime] = useState(false)

  const ratePerDay = DAILY_RATE_BYN + (overtime ? OVERTIME_BONUS_BYN : 0)
  const totalByn = ratePerDay * days
  const perWeekByn = ratePerDay * 7
  // Экономия за период пропорционально дням (в BYN)
  const savingsByn = Math.round(((HOUSING_COST_BYN + FOOD_COST_BYN) / 30) * days)

  const animatedByn = useAnimatedNumber(totalByn)
  const animatedSavings = useAnimatedNumber(savingsByn)

  // Подписи для популярных периодов
  const periodLabel =
    days <= 7 ? "неделя" : days <= 14 ? "2 недели" : days <= 31 ? "месяц вахты" : `${days} дней вахты`

  const presets = [
    { label: "Неделя", value: 7 },
    { label: "2 недели", value: 14 },
    { label: "Месяц", value: 30 },
    { label: "45 дней", value: 45 },
    { label: "60 дней", value: 60 },
  ]

  return (
    <section id="money" className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
            <Calculator className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Калькулятор заработка</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            Посчитай свою зарплату
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
            Двигай ползунок и смотри, сколько заработаешь. Прозрачный расчёт без скрытых вычетов.
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-3xl mx-auto">
          {/* Result */}
          <div className="text-center mb-8">
            <div className="text-muted-foreground mb-2">Твой заработок за {periodLabel}</div>
            <div className="flex items-end justify-center gap-2 flex-wrap">
              <span className="text-5xl sm:text-6xl md:text-7xl font-bold gradient-text leading-none">
                {animatedByn.toLocaleString("ru-RU")}
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">BYN</span>
            </div>
            <div className="text-base sm:text-lg text-muted-foreground mt-2">
              за {days} {days % 10 === 1 && days % 100 !== 11 ? "смену" : "смен"} по {ratePerDay} BYN
            </div>
          </div>

          {/* Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm sm:text-base font-medium text-foreground">Смен отработано</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{days}</span>
            </div>
            <Slider
              value={[days]}
              min={5}
              max={75}
              step={1}
              onValueChange={(v) => setDays(v[0])}
              aria-label="Количество смен"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>5 смен</span>
              <span>75 смен</span>
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-6">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => setDays(p.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  days === p.value
                    ? "bg-primary text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Overtime toggle */}
          <button
            onClick={() => setOvertime((v) => !v)}
            className="w-full flex items-center justify-between glass rounded-xl p-4 mb-6 hover:bg-card/80 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Работа с переработками</div>
                <div className="text-sm text-muted-foreground">+{OVERTIME_BONUS_BYN} BYN за смену</div>
              </div>
            </div>
            <div
              className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                overtime ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-background transition-transform ${
                  overtime ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>

          {/* Breakdown rows */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
            <div className="flex items-center gap-3 glass rounded-xl p-4">
              <Wallet className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">Ставка за смену</div>
                <div className="text-lg font-bold text-foreground">{ratePerDay} BYN</div>
              </div>
            </div>
            <div className="flex items-center gap-3 glass rounded-xl p-4">
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">В неделю</div>
                <div className="text-lg font-bold text-foreground">{perWeekByn.toLocaleString("ru-RU")} BYN</div>
              </div>
            </div>
          </div>

          {/* Savings highlight */}
          <div className="rounded-xl p-4 sm:p-5 mb-8 bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Плюс ты экономишь</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl sm:text-3xl font-bold gradient-text">
                {animatedSavings.toLocaleString("ru-RU")} BYN
              </span>
              <span className="text-sm text-muted-foreground mb-1">за {periodLabel}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Жильё бесплатно</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UtensilsCrossed className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Питание бесплатно</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              className="text-lg px-8 h-14 sm:h-16 rounded-2xl glow-primary font-semibold w-full sm:w-auto"
              onClick={() => setModalOpen(true)}
            >
              Хочу зарабатывать {totalByn.toLocaleString("ru-RU")} BYN
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Точную сумму к выплате подтвердит менеджер.
            </p>
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
