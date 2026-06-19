"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Facebook, 
  Globe, 
  MousePointerClick,
  Users,
  ExternalLink,
  Calendar,
  RefreshCw,
  ChevronDown,
  Smartphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LeadWithUTM {
  id: string
  name: string
  phone: string
  city: string | null
  status: string
  createdAt: string
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
  fbclid: string | null
  fbp: string | null
  fbc: string | null
  referrer: string | null
  landingPage: string | null
  userAgent: string | null
  source: string
  sourceMedium: string
}

interface AnalyticsData {
  total: number
  facebookLeads: number
  directLeads: number
  organicLeads: number
  bySource: { name: string; count: number }[]
  byMedium: { name: string; count: number }[]
  byCampaign: { name: string; count: number }[]
  bySourceMedium: { name: string; count: number }[]
  leads: LeadWithUTM[]
}

const periodOptions = [
  { value: '7', label: '7 дней' },
  { value: '14', label: '14 дней' },
  { value: '30', label: '30 дней' },
  { value: '90', label: '90 дней' },
]

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
  CALL_SCHEDULED: 'bg-purple-500/20 text-purple-400',
  ACCEPTED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
  NO_ANSWER: 'bg-gray-500/20 text-gray-400',
}

const statusNames: Record<string, string> = {
  NEW: 'Новый',
  IN_PROGRESS: 'В работе',
  CALL_SCHEDULED: 'Созвон',
  ACCEPTED: 'Принят',
  REJECTED: 'Отказ',
  NO_ANSWER: 'Не отвечает',
}

function getSourceIcon(source: string) {
  const s = source.toLowerCase()
  if (s.includes('facebook') || s.includes('fb') || s.includes('instagram') || s.includes('ig')) {
    return <Facebook className="w-4 h-4" />
  }
  if (s.includes('google') || s.includes('yandex')) {
    return <Globe className="w-4 h-4" />
  }
  if (s === 'direct' || s === 'none') {
    return <MousePointerClick className="w-4 h-4" />
  }
  return <TrendingUp className="w-4 h-4" />
}

function getSourceColor(source: string) {
  const s = source.toLowerCase()
  if (s.includes('facebook') || s.includes('fb')) return 'bg-blue-600'
  if (s.includes('instagram') || s.includes('ig')) return 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400'
  if (s.includes('google')) return 'bg-red-500'
  if (s.includes('yandex')) return 'bg-yellow-500'
  if (s === 'direct') return 'bg-gray-500'
  return 'bg-primary'
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [expandedLead, setExpandedLead] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [period])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhone = (phone: string) => {
    if (phone.length > 6) {
      return phone.slice(0, -4) + '****'
    }
    return phone
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Аналитика UTM</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Отслеживание источников трафика</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Period selector */}
          <div className="relative flex-1 sm:flex-none">
            <Button
              variant="outline"
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="w-full sm:w-auto gap-2 h-10"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{periodOptions.find(p => p.value === period)?.label}</span>
              <ChevronDown className="w-4 h-4 ml-auto sm:ml-0" />
            </Button>
            
            {showPeriodDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowPeriodDropdown(false)} 
                />
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden w-full sm:min-w-[140px]">
                  {periodOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPeriod(option.value)
                        setShowPeriodDropdown(false)
                      }}
                      className={cn(
                        "w-full px-4 py-3 sm:py-2.5 text-left text-sm hover:bg-secondary/50 transition-colors",
                        period === option.value && "bg-primary/10 text-primary"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <Button variant="outline" onClick={fetchData} disabled={loading} className="h-10 w-10 p-0 shrink-0">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Всего</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{data?.total || 0}</p>
          <p className="text-xs sm:text-sm text-muted-foreground sm:hidden">Всего лидов</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">FB/IG</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{data?.facebookLeads || 0}</p>
          <p className="text-xs sm:text-sm text-muted-foreground sm:hidden">Facebook/IG</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-500/20 flex items-center justify-center">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Органика</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{data?.organicLeads || 0}</p>
          <p className="text-xs sm:text-sm text-muted-foreground sm:hidden">Органика</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-500/20 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Прямой</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{data?.directLeads || 0}</p>
          <p className="text-xs sm:text-sm text-muted-foreground sm:hidden">Прямой заход</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* By Source */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm sm:text-base">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            По источникам
          </h3>
          <div className="space-y-3">
            {data?.bySource.slice(0, 5).map((item, i) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center text-white", getSourceColor(item.name))}>
                      {getSourceIcon(item.name)}
                    </div>
                    <span className="text-foreground capitalize truncate max-w-[100px] sm:max-w-none">{item.name}</span>
                  </div>
                  <span className="text-muted-foreground font-medium">{item.count}</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / (data?.total || 1)) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    className={cn("h-full rounded-full", getSourceColor(item.name))}
                  />
                </div>
              </div>
            ))}
            {(!data?.bySource || data.bySource.length === 0) && (
              <p className="text-muted-foreground text-xs sm:text-sm text-center py-4">Нет данных</p>
            )}
          </div>
        </motion.div>

        {/* By Campaign */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5"
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            По кампаниям
          </h3>
          <div className="space-y-3">
            {data?.byCampaign.slice(0, 5).map((item, i) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-foreground truncate max-w-[150px] sm:max-w-[200px]">{item.name}</span>
                  <span className="text-muted-foreground font-medium">{item.count}</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / (data?.total || 1)) * 100}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            ))}
            {(!data?.byCampaign || data.byCampaign.length === 0) && (
              <p className="text-muted-foreground text-xs sm:text-sm text-center py-4">Нет кампаний с UTM</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Leads List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Лиды с источниками
            <span className="text-muted-foreground font-normal">({data?.leads.length || 0})</span>
          </h3>
        </div>
        
        <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
          {data?.leads.map((lead) => (
            <div key={lead.id} className="group">
              <button
                onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                className="w-full p-3 sm:p-4 flex items-start sm:items-center gap-3 hover:bg-secondary/30 transition-colors text-left"
              >
                {/* Source icon */}
                <div className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white shrink-0",
                  getSourceColor(lead.utmSource || (lead.fbclid ? 'facebook' : 'direct'))
                )}>
                  {getSourceIcon(lead.utmSource || (lead.fbclid ? 'facebook' : 'direct'))}
                </div>
                
                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm sm:text-base">{lead.name}</span>
                    <span className={cn("px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs", statusColors[lead.status])}>
                      {statusNames[lead.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 text-xs sm:text-sm text-muted-foreground">
                    <span>{formatPhone(lead.phone)}</span>
                    {lead.city && <span className="hidden sm:inline">{lead.city}</span>}
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                  {/* Mobile source badge */}
                  <div className="mt-1.5 sm:hidden">
                    <span className="px-2 py-1 bg-secondary rounded-md text-[10px] text-muted-foreground">
                      {lead.source}
                    </span>
                  </div>
                </div>

                {/* Desktop source badge */}
                <div className="hidden sm:block shrink-0">
                  <span className="px-3 py-1.5 bg-secondary rounded-lg text-xs text-muted-foreground">
                    {lead.source}
                  </span>
                </div>
                
                <ChevronDown className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform shrink-0 mt-1 sm:mt-0",
                  expandedLead === lead.id && "rotate-180"
                )} />
              </button>
              
              {/* Expanded details */}
              {expandedLead === lead.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 sm:px-4 pb-3 sm:pb-4"
                >
                  <div className="bg-secondary/30 rounded-lg sm:rounded-xl p-3 sm:p-4 ml-0 sm:ml-14 space-y-3">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="bg-background/50 rounded-lg p-2.5 sm:p-3">
                        <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Источник</p>
                        <p className="text-foreground font-medium truncate">{lead.utmSource || '-'}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2.5 sm:p-3">
                        <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Канал</p>
                        <p className="text-foreground font-medium truncate">{lead.utmMedium || '-'}</p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2.5 sm:p-3 col-span-2">
                        <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Кампания</p>
                        <p className="text-foreground font-medium truncate">{lead.utmCampaign || '-'}</p>
                      </div>
                      {lead.utmTerm && (
                        <div className="bg-background/50 rounded-lg p-2.5 sm:p-3">
                          <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Ключевое слово</p>
                          <p className="text-foreground font-medium truncate">{lead.utmTerm}</p>
                        </div>
                      )}
                      {lead.utmContent && (
                        <div className="bg-background/50 rounded-lg p-2.5 sm:p-3">
                          <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Контент</p>
                          <p className="text-foreground font-medium truncate">{lead.utmContent}</p>
                        </div>
                      )}
                      {lead.fbclid && (
                        <div className="bg-background/50 rounded-lg p-2.5 sm:p-3 col-span-2">
                          <p className="text-muted-foreground text-[10px] sm:text-xs mb-0.5 sm:mb-1">Facebook Click ID</p>
                          <p className="text-foreground font-medium text-[10px] sm:text-xs truncate">{lead.fbclid}</p>
                        </div>
                      )}
                    </div>
                    
                    {(lead.referrer || lead.landingPage) && (
                      <div className="pt-2 sm:pt-3 border-t border-border/50 space-y-2">
                        {lead.referrer && (
                          <div className="flex items-start gap-2 text-xs sm:text-sm">
                            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="text-muted-foreground">Пришел с: </span>
                              <span className="text-foreground break-all">{lead.referrer}</span>
                            </div>
                          </div>
                        )}
                        {lead.landingPage && (
                          <div className="flex items-start gap-2 text-xs sm:text-sm">
                            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="text-muted-foreground">Страница: </span>
                              <span className="text-foreground break-all">{lead.landingPage}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
          
          {(!data?.leads || data.leads.length === 0) && (
            <div className="p-6 sm:p-8 text-center">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Нет лидов за выбранный период</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
