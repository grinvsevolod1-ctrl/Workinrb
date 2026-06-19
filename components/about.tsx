"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Users, Award, Building, ArrowRight, Quote } from "lucide-react"

const stats = [
  { value: "500+", label: "Работников за сезон", icon: Users },
  { value: "7 лет", label: "На рынке", icon: Award },
  { value: "50+", label: "Объектов в Москве", icon: Building },
]

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden" id="about" ref={ref}>
      {/* Background */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[200px] -translate-y-1/2" />
      
      <motion.div 
        className="max-w-6xl mx-auto relative"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 sm:px-5 py-2 sm:py-2.5 mb-4 sm:mb-6">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground">О компании</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight leading-tight">
              Работаем честно,<br />
              <span className="gradient-text">платим вовремя</span>
            </h2>
            
            <div className="space-y-4 sm:space-y-5 text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 md:mb-10">
              <p>
                Мы — подрядчик по благоустройству Москвы и области. Работаем напрямую с городом, 
                без посредников и мутных схем.
              </p>
              <p>
                <span className="text-foreground font-medium">Каждый год нанимаем 500+ человек</span> — 
                большинство возвращаются на следующий сезон. Это лучший показатель того, что мы не кидаем.
              </p>
            </div>

            {/* Quote */}
            <div className="relative glass rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 md:mb-10">
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/30 absolute top-3 left-3 sm:top-4 sm:left-4" />
              <div className="pl-6 sm:pl-8">
                <p className="text-foreground text-sm sm:text-base italic mb-2 sm:mb-3">
                  {'"'}Работал два сезона. Всё чётко — деньги каждую неделю, никаких проблем. 
                  Условия как обещали.{'"'}
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm sm:text-base font-bold">
                    А
                  </div>
                  <div>
                    <div className="text-foreground font-medium text-xs sm:text-sm">Андрей</div>
                    <div className="text-muted-foreground text-[10px] sm:text-xs">Минск, работал 2023-2024</div>
                  </div>
                </div>
              </div>
            </div>

            <motion.a
              href="#contact"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base group"
              whileHover={{ x: 5 }}
            >
              Начать работать
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>

          {/* Right - Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="grid gap-3 sm:gap-4 md:gap-5">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 group hover:bg-card/80 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-0.5 sm:mb-1">{stat.value}</div>
                      <div className="text-muted-foreground text-sm sm:text-base">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>


          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
