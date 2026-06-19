"use client"

import { useState, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    q: "Как быстро можно начать работать?",
    a: "Первый заезд возможен уже через 3-5 дней после звонка. Помогаем с билетами и встречаем на месте.",
  },
  {
    q: "Что нужно для оформления?",
    a: "Только паспорт гражданина Республики Беларусь. С регистрацией и всеми документами поможем на месте.",
  },
  {
    q: "Реально ли получать 3 000 BYN в месяц?",
    a: "Да, если работать все 30 дней. Ставка 100 BYN в день — это 3 000 BYN за месяц. Это реальные цифры, не завышенные.",
  },
  {
    q: "Какие условия проживания?",
    a: "Комфортные общежития: комнаты на 4 человека, у каждого своя кровать. Есть отопление, душ, постельное бельё, телевизор. Всё что нужно для нормальной жизни.",
  },
  {
    q: "Когда и как получу деньги?",
    a: "Выплата по окончании вахты — наличкой или на карту, как удобнее. В первую неделю можно получить аванс. За 7 лет работы ни одной задержки.",
  },
  {
    q: "Можно ли приехать с другом/братом?",
    a: "Да, работать вместе даже лучше. Если есть знакомые — приезжайте бригадой, поселим вместе.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden" id="faq" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />

      <motion.div 
        className="max-w-4xl mx-auto relative"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-10 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 sm:px-5 py-2 sm:py-2.5 mb-4 sm:mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-foreground">Частые вопросы</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight text-balance">
            Ответы на <span className="gradient-text">вопросы</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Собрали самые частые вопросы. Если не нашёл ответ — заполни форму ниже.
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              className="glass rounded-xl sm:rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={cn(
                  "w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 text-left transition-colors",
                  openIndex === i ? "bg-card/50" : "hover:bg-card/30"
                )}
              >
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  openIndex === i ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                  <span className="font-bold text-xs sm:text-sm">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <span className="font-medium sm:font-semibold text-sm sm:text-base text-foreground flex-1 pr-2 sm:pr-4">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-4 pb-4 pl-14 sm:px-5 sm:pb-5 sm:pl-16 md:px-6 md:pb-6 md:pl-20">
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="mt-8 sm:mt-10 md:mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">Остались вопросы?</p>
          <a 
            href="#contact"
            className="inline-flex items-center gap-2 sm:gap-3 glass rounded-full px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-card/80 transition-colors group"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="text-foreground font-medium text-sm sm:text-base">Оставить заявку</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
