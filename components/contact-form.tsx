"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { CheckCircle2, ArrowRight, MapPin, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SmartPhoneInput, isValidPhoneNumber } from "@/components/phone-input"
import { trackMetaLead } from "@/components/meta-pixel"
import { useUTM } from "@/hooks/use-utm"

// Declare ym for TypeScript
declare global {
  interface Window {
    ym?: (id: number, action: string, goal: string) => void
  }
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phone, setPhone] = useState("")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const utmParams = useUTM()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Валидация телефона
    if (!phone || !isValidPhoneNumber(phone)) {
      setError("Введите корректный номер телефона")
      return
    }
    
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      phone: phone,
      message: formData.get('city') as string,
      // UTM параметры
      ...utmParams,
    }

    try {
      const response = await fetch('/api/send-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Ошибка отправки')
      }

      setIsSubmitted(true)
      
      // Яндекс.Метрика цель - заявка из основной формы
      if (typeof window !== 'undefined' && window.ym) {
        window.ym(109238611, 'reachGoal', 'lead_form_submit')
      }
      
      // Meta Pixel - отслеживание лида
      trackMetaLead()
    } catch {
      setError('Не удалось отправить заявку. Попробуйте позже или позвоните нам.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden" id="contact" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[200px]" />
      
      <motion.div 
        className="max-w-6xl mx-auto relative"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 xl:gap-20">
          {/* Left side - CTA */}
          <motion.div 
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 sm:px-5 py-2 sm:py-2.5 mb-4 sm:mb-6 w-fit">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Начни сейчас</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight leading-tight">
              Готов<br />
              <span className="gradient-text">зарабатывать?</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 md:mb-10 leading-relaxed">
              Оставь номер — перезвоним в течение часа. 
              Ответим на все вопросы и договоримся о дате заезда.
            </p>

            {/* Features */}
            <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-6 sm:mb-8 md:mb-10">
              {[
                { icon: Clock, text: "Первый заезд возможен через 3 дня" },
                { icon: MapPin, text: "Помогаем с билетами и трансфером" },
                { icon: CheckCircle2, text: "Отвечаем на любые вопросы честно" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <span className="text-foreground text-sm sm:text-base">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Direct contacts */}
            <div className="space-y-3 sm:space-y-4">
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Локация работы</div>
                  <div className="text-lg sm:text-xl text-foreground font-bold">Москва и область</div>
                </div>
              </div>
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Наш сайт</div>
                  <div className="text-base sm:text-lg text-foreground font-semibold">workinrb.top</div>
                </div>
              </div>
              <a 
                href="https://www.instagram.com/workinrb"
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-card/80 transition-colors group"
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Instagram</div>
                  <div className="text-base sm:text-lg text-foreground font-semibold group-hover:text-primary transition-colors">@workinrb</div>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 glow-primary">
              {isSubmitted ? (
                <motion.div 
                  className="text-center py-8 sm:py-10 md:py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 md:mb-8">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Заявка отправлена!</h3>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8 px-2">
                    Мы перезвоним тебе в ближайший час.<br />Приготовь паспорт для оформления.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSubmitted(false)}
                    className="rounded-xl"
                  >
                    Отправить ещё
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Оставить заявку</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Перезвоним в течение часа</p>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="name" className="text-foreground font-medium text-sm sm:text-base">
                      Как тебя зовут?
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Имя"
                      required
                      className="h-12 sm:h-14 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg sm:rounded-xl text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="phone" className="text-foreground font-medium text-sm sm:text-base">
                      Телефон для связи
                    </Label>
                    <SmartPhoneInput
                      value={phone}
                      onChange={setPhone}
                      id="phone"
                      name="phone"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="city" className="text-foreground font-medium text-sm sm:text-base">
                      Из какого города?
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Минск, Гомель, Брест..."
                      className="h-12 sm:h-14 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg sm:rounded-xl text-sm sm:text-base"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg gap-2 sm:gap-3 glow-primary rounded-lg sm:rounded-xl font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Отправляем...
                      </>
                    ) : (
                      <>
                        Отправить заявку
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>

                  {error && (
                    <p className="text-center text-sm text-red-400 bg-red-500/10 rounded-xl p-3">
                      {error}
                    </p>
                  )}

                  <p className="text-center text-xs text-muted-foreground">
                    Нажимая кнопку, ты соглашаешься на обработку персональных данных
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
