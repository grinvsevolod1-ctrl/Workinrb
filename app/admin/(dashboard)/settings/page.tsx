"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface SiteSettings {
  heroBadgeText: string
  heroBadgeHighlight: string
  heroHeadingLine1: string
  heroSalaryText: string
  heroSubtitlePrefix: string
  heroMenOnlyBadge: string
  heroSubtitleSuffix: string
  heroStat1Value: string
  heroStat1Label: string
  heroStat2Value: string
  heroStat2Label: string
  heroStat3Value: string
  heroStat3Label: string
  contactPhone: string
  telegramLink: string
  yandexMetrikaId: string
  metaPixelId: string
  telegramNotificationsEnabled: boolean
  facebookCapiEnabled: boolean
  metaPixelEnabled: boolean
  yandexMetrikaEnabled: boolean
  leadFormEnabled: boolean
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10"
      />
    </div>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6 space-y-4">
      <div>
        <h2 className="text-base lg:text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs lg:text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch(() => setError("Не удалось загрузить настройки"))
      .finally(() => setLoading(false))
  }, [])

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения")
      setSettings(data.settings)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        {error || "Настройки недоступны"}
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6 max-w-3xl pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Настройки сайта</h1>
          <p className="text-sm text-muted-foreground">Управление контентом и функциями лендинга</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto h-10">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Сохранено" : "Сохранить"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}

      <Section title="Главный экран (Hero)" description="Заголовки и тексты первого экрана">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Бейдж (статус)" value={settings.heroBadgeText} onChange={(v) => update("heroBadgeText", v)} />
          <Field label="Бейдж (выделение)" value={settings.heroBadgeHighlight} onChange={(v) => update("heroBadgeHighlight", v)} />
          <Field label="Заголовок (строка 1)" value={settings.heroHeadingLine1} onChange={(v) => update("heroHeadingLine1", v)} />
          <Field label="Зарплата (выделено)" value={settings.heroSalaryText} onChange={(v) => update("heroSalaryText", v)} />
        </div>
        <Field label="Подзаголовок (начало)" value={settings.heroSubtitlePrefix} onChange={(v) => update("heroSubtitlePrefix", v)} />
        <Field label="Красная плашка" value={settings.heroMenOnlyBadge} onChange={(v) => update("heroMenOnlyBadge", v)} />
        <Field label="Подзаголовок (конец)" value={settings.heroSubtitleSuffix} onChange={(v) => update("heroSubtitleSuffix", v)} />
      </Section>

      <Section title="Статистика" description="Три блока цифр на главном экране">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Цифра 1" value={settings.heroStat1Value} onChange={(v) => update("heroStat1Value", v)} />
          <Field label="Подпись 1" value={settings.heroStat1Label} onChange={(v) => update("heroStat1Label", v)} />
          <Field label="Цифра 2" value={settings.heroStat2Value} onChange={(v) => update("heroStat2Value", v)} />
          <Field label="Подпись 2" value={settings.heroStat2Label} onChange={(v) => update("heroStat2Label", v)} />
          <Field label="Цифра 3" value={settings.heroStat3Value} onChange={(v) => update("heroStat3Value", v)} />
          <Field label="Подпись 3" value={settings.heroStat3Label} onChange={(v) => update("heroStat3Label", v)} />
        </div>
      </Section>

      <Section title="Контакты">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Телефон" value={settings.contactPhone} onChange={(v) => update("contactPhone", v)} placeholder="+375 ..." />
          <Field label="Ссылка на Telegram" value={settings.telegramLink} onChange={(v) => update("telegramLink", v)} placeholder="https://t.me/..." />
        </div>
      </Section>

      <Section title="Трекинг" description="ID счётчиков аналитики">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Yandex Metrika ID" value={settings.yandexMetrikaId} onChange={(v) => update("yandexMetrikaId", v)} />
          <Field label="Meta Pixel ID" value={settings.metaPixelId} onChange={(v) => update("metaPixelId", v)} />
        </div>
      </Section>

      <Section title="Функции" description="Включение и отключение возможностей сайта">
        <Toggle
          label="Форма заявки"
          description="Приём заявок с сайта"
          checked={settings.leadFormEnabled}
          onChange={(v) => update("leadFormEnabled", v)}
        />
        <Toggle
          label="Уведомления в Telegram"
          description="Отправка новых лидов в Telegram-чаты"
          checked={settings.telegramNotificationsEnabled}
          onChange={(v) => update("telegramNotificationsEnabled", v)}
        />
        <Toggle
          label="Facebook Conversions API"
          description="Серверная отправка событий в Facebook"
          checked={settings.facebookCapiEnabled}
          onChange={(v) => update("facebookCapiEnabled", v)}
        />
        <Toggle
          label="Meta Pixel"
          description="Клиентский пиксель Facebook на сайте"
          checked={settings.metaPixelEnabled}
          onChange={(v) => update("metaPixelEnabled", v)}
        />
        <Toggle
          label="Yandex Metrika"
          description="Счётчик Яндекс.Метрики на сайте"
          checked={settings.yandexMetrikaEnabled}
          onChange={(v) => update("yandexMetrikaEnabled", v)}
        />
      </Section>
    </div>
  )
}
