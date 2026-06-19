"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Home, UtensilsCrossed, Shirt, Clock, MapPin, Shield, Check } from "lucide-react"

const conditions = [
  {
    icon: Home,
    title: "Жильё",
    highlight: "Бесплатно",
    details: "Общежитие со всеми удобствами. Отопление, душ, постельное бельё. Всё что нужно для нормальной жизни.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: UtensilsCrossed,
    title: "Питание",
    highlight: "Бесплатно",
    details: "Бесплатное питание. Готовит наш повар. Голодным точно не останешься.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Shirt,
    title: "Одежда",
    highlight: "Выдаём",
    details: "Форма, обувь, перчатки — всё необходимое. Приезжай налегке.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Clock,
    title: "График",
    highlight: "Вахта от 30 дней",
    details: "Работа с 8:00 до 18:00. Минимум месяц, хочешь дольше — без проблем.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: MapPin,
    title: "Локация",
    highlight: "Москва и область",
    details: "Работаем в черте города и ближайшем Подмосковье. Никакой глуши.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Shield,
    title: "Документы",
    highlight: "Помогаем",
    details: "Нужен паспорт РБ. С регистрацией и разрешениями поможем разобраться.",
    color: "from-cyan-500 to-blue-600",
  },
]

export function Conditions() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden" id="conditions" ref={ref}>
      {/* Background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />
      
      <motion.div 
        className="max-w-6xl mx-auto relative"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Header */}
        <motion.div className="text-center mb-10 sm:mb-16 md:mb-20" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 sm:px-5 py-2 sm:py-2.5 mb-4 sm:mb-6">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-foreground">Всё включено</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight text-balance">
            Условия <span className="gradient-text">работы</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Честно рассказываем что есть, чтобы потом не было сюрпризов
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-10 sm:mb-16"
          variants={containerVariants}
        >
          {conditions.map((item, i) => (
            <motion.div 
              key={item.title}
              className="group relative glass rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 hover:bg-card/80 transition-all duration-500 overflow-hidden"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {/* Gradient orb on hover */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${item.color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <div className="relative">
                {/* Icon and check */}
                <div className="flex items-start justify-between mb-4 sm:mb-5">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} p-[1px]`}>
                    <div className="w-full h-full rounded-xl sm:rounded-2xl bg-card flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">{item.title}</h3>
                <div className="text-primary font-semibold text-xs sm:text-sm mb-2 sm:mb-3">{item.highlight}</div>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.details}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
