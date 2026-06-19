import dynamic from "next/dynamic"
import { Hero } from "@/components/hero"
import { getSettings } from "@/lib/settings"

// Динамический импорт тяжелых компонентов
const SalaryBreakdown = dynamic(() => import("@/components/salary-breakdown").then(mod => ({ default: mod.SalaryBreakdown })), {
  loading: () => <div className="min-h-[600px] bg-background" />
})
const Conditions = dynamic(() => import("@/components/conditions").then(mod => ({ default: mod.Conditions })), {
  loading: () => <div className="min-h-[600px] bg-background" />
})
const About = dynamic(() => import("@/components/about").then(mod => ({ default: mod.About })), {
  loading: () => <div className="min-h-[400px] bg-background" />
})
const FAQ = dynamic(() => import("@/components/faq").then(mod => ({ default: mod.FAQ })), {
  loading: () => <div className="min-h-[500px] bg-background" />
})
const ContactForm = dynamic(() => import("@/components/contact-form").then(mod => ({ default: mod.ContactForm })), {
  loading: () => <div className="min-h-[500px] bg-background" />
})
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="min-h-[200px] bg-background" />
})

export default async function Home() {
  const settings = await getSettings()

  return (
    <main className="min-h-screen bg-background">
      <Hero settings={settings} />
      <SalaryBreakdown />
      <Conditions />
      <About />
      <FAQ />
      <ContactForm />
      <Footer />
    </main>
  )
}
