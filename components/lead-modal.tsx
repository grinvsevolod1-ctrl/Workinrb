"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ArrowRight, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SmartPhoneInput, isValidPhoneNumber } from "@/components/phone-input"
import { trackMetaLead } from "@/components/meta-pixel"
import { useUTM } from "@/hooks/use-utm"

// Declare ym for TypeScript
declare global {
  interface Window {
    ym?: (id: number, action: string, goal: string) => void
  }
}

interface LeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadModal({ open, onOpenChange }: LeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phone, setPhone] = useState("")
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
      
      // Яндекс.Метрика цель - заявка из модального окна
      if (typeof window !== 'undefined' && window.ym) {
        window.ym(109238611, 'reachGoal', 'lead_modal_submit')
      }
      
      // Meta Pixel - отслеживание лида
      trackMetaLead()
    } catch {
      setError('Не удалось отправить заявку. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after animation
    setTimeout(() => {
      setIsSubmitted(false)
      setError(null)
      setPhone("")
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="w-[calc(100%-2rem)] max-w-md bg-background/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden rounded-2xl sm:rounded-3xl mx-auto"
        showCloseButton={false}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="relative p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div 
                key="success"
                className="text-center py-6 sm:py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Заявка отправлена!</h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
                  Мы перезвоним тебе в ближайший час
                </p>
                <Button onClick={handleClose} className="rounded-xl">
                  Закрыть
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DialogHeader className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 text-primary mb-1 sm:mb-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium">Быстрая заявка</span>
                  </div>
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                    Оставить заявку
                  </DialogTitle>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Заполни форму — перезвоним в течение часа
                  </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="modal-name" className="text-foreground font-medium text-xs sm:text-sm">
                      Имя
                    </Label>
                    <Input
                      id="modal-name"
                      name="name"
                      type="text"
                      placeholder="Как тебя зовут?"
                      required
                      className="h-10 sm:h-12 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg sm:rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="modal-phone" className="text-foreground font-medium text-xs sm:text-sm">
                      Телефон
                    </Label>
                    <SmartPhoneInput
                      value={phone}
                      onChange={setPhone}
                      id="modal-phone"
                      name="phone"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="modal-city" className="text-foreground font-medium text-xs sm:text-sm">
                      Город
                    </Label>
                    <Input
                      id="modal-city"
                      name="city"
                      type="text"
                      placeholder="Минск, Гомель..."
                      className="h-10 sm:h-12 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-lg sm:rounded-xl text-sm"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 sm:h-14 text-sm sm:text-base gap-2 rounded-lg sm:rounded-xl font-semibold mt-1 sm:mt-2"
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

                  <p className="text-center text-[10px] sm:text-xs text-muted-foreground pt-1 sm:pt-2">
                    Нажимая кнопку, ты соглашаешься на обработку данных
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
