"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ArrowDown, Users, Clock, ChevronRight, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LeadModal } from "@/components/lead-modal"
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings"

export function Hero({ settings = DEFAULT_SETTINGS }: { settings?: SiteSettings }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const stats = [
    { icon: Users, value: settings.heroStat1Value, label: settings.heroStat1Label },
    { icon: Clock, value: settings.heroStat2Value, label: settings.heroStat2Label },
    { icon: Leaf, value: settings.heroStat3Value, label: settings.heroStat3Label },
  ]

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-landscaping.jpg"
          alt="Работа подсобником в Москве"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-xl text-foreground tracking-tight">WorkInRB</span>
              <div className="text-xs text-muted-foreground">workinrb.top</div>
            </div>
          </div>
          
          <a 
            href="#contact"
            className="hidden md:flex items-center gap-3 glass rounded-full px-5 py-3 hover:bg-card/80 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <span className="text-foreground font-medium">Оставить заявку</span>
          </a>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center px-4 sm:px-6 md:px-12 py-8 md:py-12">
          <div className="max-w-4xl w-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 glass rounded-full px-5 py-2.5 mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-sm text-foreground font-medium">{settings.heroBadgeText}</span>
              <span className="text-muted-foreground">—</span>
              <span className="text-sm text-primary font-semibold">{settings.heroBadgeHighlight}</span>
            </div>

            {/* Heading - NO ANIMATION for LCP */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-4 sm:mb-6 leading-[0.95] tracking-tight">
              <span className="text-balance">{settings.heroHeadingLine1}</span>
              <br />
              <span className="gradient-text">{settings.heroSalaryText}</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 md:mb-10 max-w-2xl leading-relaxed">
              {settings.heroSubtitlePrefix}{" "}
              <span className="bg-red-600 text-white px-2 py-0.5 rounded-md font-bold">{settings.heroMenOnlyBadge}</span>.{" "}
              <span className="text-foreground">{settings.heroSubtitleSuffix}</span>
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-16">
              <Button 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 h-14 sm:h-16 gap-2 sm:gap-3 glow-primary rounded-2xl text-primary-foreground font-semibold group"
                onClick={() => setModalOpen(true)}
              >
                Оставить заявку
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base sm:text-lg px-6 sm:px-8 h-14 sm:h-16 rounded-2xl glass border-border/50 hover:bg-card/80 font-medium"
                asChild
              >
                <a href="#contact" className="gap-2 sm:gap-3">
                  <ArrowDown className="w-5 h-5" />
                  Узнать больше
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xl">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 mb-2 sm:mb-3">
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Листай вниз</span>
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Lead Modal */}
      <LeadModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  )
}
