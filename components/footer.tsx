"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, ArrowUpRight, Globe } from "lucide-react"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative overflow-hidden">
      {/* Top decorative border */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 md:gap-12">
          {/* Brand - takes more space */}
          <div className="sm:col-span-2 md:col-span-5">
            <motion.div 
              className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
              whileHover={{ x: 5 }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg sm:text-xl text-foreground tracking-tight">WorkInRB</span>
                <div className="text-[10px] sm:text-xs text-muted-foreground">workinrb.top</div>
              </div>
            </motion.div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mb-5 sm:mb-8">
              Подсобные работы на стройке в Москве и области. Честные условия, стабильная зарплата 100 BYN/день, 
              нормальный коллектив. Работаем с 2019 года. Только для мужчин.
            </p>
            
            {/* Contact link */}
            <a 
              href="#contact"
              className="inline-flex items-center gap-2 sm:gap-3 glass rounded-lg sm:rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-card/80 transition-colors group"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="text-foreground font-medium text-sm sm:text-base">Оставить заявку</span>
            </a>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-foreground mb-4 sm:mb-6 text-xs sm:text-sm uppercase tracking-wider">Разделы</h4>
            <nav className="flex flex-col gap-2.5 sm:gap-4">
              {[
                { href: "#money", label: "Зарплата" },
                { href: "#conditions", label: "Условия работы" },
                { href: "#about", label: "О компании" },
                { href: "#faq", label: "Вопросы" },
                { href: "#contact", label: "Контакты" },
              ].map((link) => (
                <a 
                  key={link.href}
                  href={link.href} 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group text-sm sm:text-base"
                >
                  {link.label}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </nav>
          </div>

          {/* Contacts */}
          <div className="sm:col-span-2 md:col-span-4">
            <h4 className="font-semibold text-foreground mb-4 sm:mb-6 text-xs sm:text-sm uppercase tracking-wider">Контакты</h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 sm:gap-4 glass rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Локация</div>
                  <div className="text-foreground font-medium text-sm sm:text-base">Москва и область</div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 glass rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Сайт</div>
                  <div className="text-foreground font-medium text-sm sm:text-base">workinrb.top</div>
                </div>
              </div>
              <a 
                href="https://www.instagram.com/workinrb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 sm:gap-4 glass rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-card/80 transition-colors group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Instagram</div>
                  <div className="text-foreground font-medium text-sm sm:text-base group-hover:text-primary transition-colors">@workinrb</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <p>2024 - 2026 WorkInRB | workinrb.top</p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Условия использования
            </Link>
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              Наверх
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
