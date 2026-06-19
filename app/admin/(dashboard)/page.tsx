"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Clock, 
  Calendar,
  CalendarDays,
  Loader2,
  Phone,
  MapPin,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Stats {
  total: number
  new: number
  inProgress: number
  accepted: number
  rejected: number
  today: number
  week: number
  month: number
  conversionRate: number
}

interface Lead {
  id: string
  name: string
  phone: string
  city: string | null
  status: string
  createdAt: string
  assignedTo: { name: string } | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
  NEW: { label: "Новый", color: "bg-blue-500" },
  IN_PROGRESS: { label: "В работе", color: "bg-yellow-500" },
  CALL_SCHEDULED: { label: "Созвон", color: "bg-purple-500" },
  ACCEPTED: { label: "Принят", color: "bg-green-500" },
  REJECTED: { label: "Отказ", color: "bg-red-500" },
  NO_ANSWER: { label: "Не отвечает", color: "bg-gray-500" },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats(data.stats)
      setRecentLeads(data.recentLeads)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin text-primary" />
      </div>
    )
  }

  const statCards = [
    { label: "Всего", value: stats?.total || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Новых", value: stats?.new || 0, icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "В работе", value: stats?.inProgress || 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Принято", value: stats?.accepted || 0, icon: UserCheck, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Отказы", value: stats?.rejected || 0, icon: UserX, color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Конверсия", value: `${stats?.conversionRate || 0}%`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
  ]

  const periodCards = [
    { label: "Сегодня", value: stats?.today || 0, icon: Clock },
    { label: "Неделя", value: stats?.week || 0, icon: Calendar },
    { label: "Месяц", value: stats?.month || 0, icon: CalendarDays },
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Дашборд</h1>
        <p className="text-sm text-muted-foreground">Обзор статистики</p>
      </div>

      {/* Main Stats - 2 cols mobile, 3 cols tablet, 6 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl lg:rounded-2xl p-3 lg:p-4"
          >
            <div className={cn("w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center mb-2 lg:mb-3", stat.bg)}>
              <stat.icon className={cn("w-4 h-4 lg:w-5 lg:h-5", stat.color)} />
            </div>
            <p className="text-xl lg:text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {periodCards.map((period, i) => (
          <motion.div
            key={period.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="bg-card border border-border rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{period.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{period.label}</p>
              </div>
              <div className="hidden sm:flex w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-primary/10 items-center justify-center">
                <period.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Leads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl lg:rounded-2xl"
      >
        <div className="p-4 lg:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-foreground">Последние заявки</h2>
            <p className="text-xs lg:text-sm text-muted-foreground">10 последних</p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs lg:text-sm text-primary hover:underline flex items-center gap-1"
          >
            Все
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="divide-y divide-border">
          {recentLeads.length === 0 ? (
            <div className="p-6 lg:p-8 text-center text-muted-foreground text-sm">
              Пока нет заявок
            </div>
          ) : (
            recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-sm lg:text-base">
                    {lead.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm lg:text-base text-foreground truncate">{lead.name}</p>
                    <span className={cn(
                      "text-[10px] lg:text-xs px-1.5 lg:px-2 py-0.5 rounded-full text-white shrink-0",
                      statusLabels[lead.status]?.color || "bg-gray-500"
                    )}>
                      {statusLabels[lead.status]?.label || lead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1 truncate">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span className="truncate">{lead.phone}</span>
                    </span>
                    {lead.city && (
                      <span className="hidden sm:flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {lead.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                  <p className="text-[10px] lg:text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 sm:hidden" />
              </Link>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
