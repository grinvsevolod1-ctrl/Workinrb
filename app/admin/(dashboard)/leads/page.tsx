"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  Filter, 
  Loader2, 
  Phone, 
  MapPin,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Lead {
  id: string
  name: string
  phone: string
  city: string | null
  status: string
  source: string
  createdAt: string
  assignedTo: { id: string; name: string } | null
  _count: { comments: number }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const statusOptions = [
  { value: "all", label: "Все статусы" },
  { value: "NEW", label: "Новые" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "CALL_SCHEDULED", label: "Созвон назначен" },
  { value: "ACCEPTED", label: "Принятые" },
  { value: "REJECTED", label: "Отказы" },
  { value: "NO_ANSWER", label: "Не отвечает" },
]

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: "Новый", color: "text-blue-400", bg: "bg-blue-500/20" },
  IN_PROGRESS: { label: "В работе", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  CALL_SCHEDULED: { label: "Созвон", color: "text-purple-400", bg: "bg-purple-500/20" },
  ACCEPTED: { label: "Принят", color: "text-green-400", bg: "bg-green-500/20" },
  REJECTED: { label: "Отказ", color: "text-red-400", bg: "bg-red-500/20" },
  NO_ANSWER: { label: "Не отвечает", color: "text-gray-400", bg: "bg-gray-500/20" },
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (status !== "all") params.append("status", status)
      if (search) params.append("search", search)

      const res = await fetch(`/api/admin/leads?${params}`)
      const data = await res.json()
      setLeads(data.leads)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch leads:", error)
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => {
    const debounce = setTimeout(fetchLeads, 300)
    return () => clearTimeout(debounce)
  }, [fetchLeads])

  const handleExport = async () => {
    try {
      const res = await fetch("/api/admin/leads/export")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `leads-${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Лиды</h1>
          <p className="text-sm text-muted-foreground">
            Всего {pagination?.total || 0} заявок
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          <span className="sm:inline">Экспорт</span>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, телефону..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 h-10 lg:h-11 bg-card border-border rounded-xl text-sm"
          />
        </div>
        
        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Фильтры
          </span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
        </button>

        {/* Filters */}
        <div className={cn(
          "lg:flex items-center gap-3",
          showFilters ? "flex flex-col" : "hidden"
        )}>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="w-full lg:w-48 h-10 lg:h-11 bg-card border-border rounded-xl text-sm">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl lg:rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8 lg:p-12">
            <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin text-primary" />
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 lg:p-12 text-center text-muted-foreground text-sm">
            Лиды не найдены
          </div>
        ) : (
          <>
            {/* Desktop Table Header - hidden on mobile */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-secondary/30 text-sm font-medium text-muted-foreground border-b border-border">
              <div className="col-span-3">Имя / Контакт</div>
              <div className="col-span-2">Город</div>
              <div className="col-span-2">Статус</div>
              <div className="col-span-2">Менеджер</div>
              <div className="col-span-2">Дата</div>
              <div className="col-span-1 text-center">Комм.</div>
            </div>

            {/* Lead Items */}
            <div className="divide-y divide-border">
              {leads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="block hover:bg-secondary/20 transition-colors"
                  >
                    {/* Mobile Card View */}
                    <div className="lg:hidden p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{lead.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span className="truncate">{lead.phone}</span>
                          </p>
                        </div>
                        <span className={cn(
                          "shrink-0 px-2 py-1 rounded-lg text-xs font-medium",
                          statusLabels[lead.status]?.bg,
                          statusLabels[lead.status]?.color
                        )}>
                          {statusLabels[lead.status]?.label || lead.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {lead.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lead.city}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                        {lead._count.comments > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {lead._count.comments}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Desktop Table Row */}
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-4 items-center">
                      <div className="col-span-3">
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </p>
                      </div>
                      <div className="col-span-2">
                        {lead.city ? (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {lead.city}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <span className={cn(
                          "inline-flex px-2.5 py-1 rounded-lg text-xs font-medium",
                          statusLabels[lead.status]?.bg,
                          statusLabels[lead.status]?.color
                        )}>
                          {statusLabels[lead.status]?.label || lead.status}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {lead.assignedTo?.name || "-"}
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString("ru-RU")}
                      </div>
                      <div className="col-span-1 text-center">
                        {lead._count.comments > 0 && (
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            {lead._count.comments}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs lg:text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
