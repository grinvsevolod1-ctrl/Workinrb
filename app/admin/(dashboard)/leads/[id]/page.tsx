"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  Send,
  Loader2,
  Trash2,
  History,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Comment {
  id: string
  text: string
  createdAt: string
  author: { id: string; name: string }
}

interface StatusChange {
  id: string
  oldStatus: string | null
  newStatus: string
  createdAt: string
  changedBy: { id: string; name: string } | null
}

interface Lead {
  id: string
  name: string
  phone: string
  city: string | null
  status: string
  source: string
  createdAt: string
  updatedAt: string
  assignedTo: { id: string; name: string; email: string } | null
  comments: Comment[]
  statusHistory: StatusChange[]
}

const statusOptions = [
  { value: "NEW", label: "Новый", color: "text-blue-400", bg: "bg-blue-500/20" },
  { value: "IN_PROGRESS", label: "В работе", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  { value: "CALL_SCHEDULED", label: "Созвон назначен", color: "text-purple-400", bg: "bg-purple-500/20" },
  { value: "ACCEPTED", label: "Принят", color: "text-green-400", bg: "bg-green-500/20" },
  { value: "REJECTED", label: "Отказ", color: "text-red-400", bg: "bg-red-500/20" },
  { value: "NO_ANSWER", label: "Не отвечает", color: "text-gray-400", bg: "bg-gray-500/20" },
]

const statusLabels: Record<string, { label: string; color: string; bg: string }> = Object.fromEntries(
  statusOptions.map(s => [s.value, { label: s.label, color: s.color, bg: s.bg }])
)

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [userRole, setUserRole] = useState<"ADMIN" | "MANAGER" | null>(null)

  useEffect(() => {
    fetchLead()
    fetchUserRole()
  }, [id])

  const fetchUserRole = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUserRole(data.user?.role || null)
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error)
    }
  }

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`)
      if (!res.ok) {
        router.push("/admin/leads")
        return
      }
      const data = await res.json()
      setLead(data.lead)
    } catch (error) {
      console.error("Failed to fetch lead:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!lead || newStatus === lead.status) return
    
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchLead()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/leads/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      })
      if (res.ok) {
        setNewComment("")
        fetchLead()
      }
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/admin/leads")
      }
    } catch (error) {
      console.error("Failed to delete lead:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Лид не найден</p>
        <Link href="/admin/leads" className="text-primary hover:underline mt-2 inline-block">
          Вернуться к списку
        </Link>
      </div>
    )
  }

  const currentStatus = statusLabels[lead.status] || { label: lead.status, color: "text-gray-400", bg: "bg-gray-500/20" }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <Link
            href="/admin/leads"
            className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg lg:text-2xl font-bold text-foreground truncate">{lead.name}</h1>
            <p className="text-xs lg:text-sm text-muted-foreground truncate">ID: {lead.id.slice(0, 8)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Call button - mobile friendly */}
          <a
            href={`tel:${lead.phone}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-9 lg:h-10 px-3 lg:px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="sm:hidden">Позвонить</span>
            <span className="hidden sm:inline">{lead.phone}</span>
          </a>
          {userRole === "ADMIN" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 lg:h-10 w-9 lg:w-auto px-0 lg:px-3">
                  <Trash2 className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Удалить</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить лид?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Лид и все данные будут удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="mt-0">Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Mobile Status Card - показываем сверху на мобильных */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:hidden bg-card border border-border rounded-xl p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Статус</p>
            <span className={cn(
              "inline-flex px-2.5 py-1 rounded-lg text-xs font-medium",
              currentStatus.bg,
              currentStatus.color
            )}>
              {currentStatus.label}
            </span>
          </div>
          <Select
            value={lead.status}
            onValueChange={handleStatusChange}
            disabled={updatingStatus}
          >
            <SelectTrigger className="w-36 h-9 bg-secondary/30 border-border rounded-lg text-sm">
              <SelectValue placeholder="Изменить" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className={cn("flex items-center gap-2", opt.color)}>
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6"
          >
            <h2 className="text-base lg:text-lg font-semibold text-foreground mb-3 lg:mb-4">Контакты</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-3 p-3 lg:p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors group"
              >
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] lg:text-xs text-muted-foreground">Телефон</p>
                  <p className="font-medium text-sm lg:text-base text-foreground truncate">{lead.phone}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </a>
              <div className="flex items-center gap-3 p-3 lg:p-4 bg-secondary/30 rounded-xl">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] lg:text-xs text-muted-foreground">Город</p>
                  <p className="font-medium text-sm lg:text-base text-foreground">{lead.city || "Не указан"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 bg-secondary/30 rounded-xl">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] lg:text-xs text-muted-foreground">Дата заявки</p>
                  <p className="font-medium text-sm lg:text-base text-foreground">
                    {new Date(lead.createdAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 lg:p-4 bg-secondary/30 rounded-xl">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] lg:text-xs text-muted-foreground">Менеджер</p>
                  <p className="font-medium text-sm lg:text-base text-foreground">{lead.assignedTo?.name || "Не назначен"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6"
          >
            <h2 className="text-base lg:text-lg font-semibold text-foreground mb-3 lg:mb-4">
              Комментарии ({lead.comments.length})
            </h2>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4 lg:mb-6">
              <Textarea
                placeholder="Написать комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-secondary/30 border-border rounded-xl mb-3 min-h-[80px] lg:min-h-[100px] text-sm lg:text-base"
              />
              <Button type="submit" size="sm" disabled={submitting || !newComment.trim()} className="h-9 lg:h-10">
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Отправить
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 lg:space-y-4">
              {lead.comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 lg:py-6 text-sm">Пока нет комментариев</p>
              ) : (
                lead.comments.map((comment) => (
                  <div key={comment.id} className="p-3 lg:p-4 bg-secondary/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm lg:text-base text-foreground">{comment.author.name}</p>
                      <p className="text-[10px] lg:text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar - hidden on mobile, shown at top instead */}
        <div className="hidden lg:block space-y-6">
          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Статус</h2>
            <div className="space-y-3">
              <div className={cn(
                "inline-flex px-3 py-1.5 rounded-lg text-sm font-medium",
                currentStatus.bg,
                currentStatus.color
              )}>
                {currentStatus.label}
              </div>
              <Select
                value={lead.status}
                onValueChange={handleStatusChange}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-full bg-secondary/30 border-border rounded-xl">
                  <SelectValue placeholder="Изменить статус" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={cn("flex items-center gap-2", opt.color)}>
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Status History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              История
            </h2>
            <div className="space-y-3">
              {lead.statusHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm">Нет изменений</p>
              ) : (
                lead.statusHistory.map((change) => (
                  <div key={change.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="text-foreground">
                        {change.oldStatus ? (
                          <>
                            <span className={statusLabels[change.oldStatus]?.color}>
                              {statusLabels[change.oldStatus]?.label}
                            </span>
                            {" -> "}
                          </>
                        ) : null}
                        <span className={statusLabels[change.newStatus]?.color}>
                          {statusLabels[change.newStatus]?.label}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {change.changedBy?.name || "Система"} • {new Date(change.createdAt).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Mobile History - показываем внизу на мобильных */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:hidden bg-card border border-border rounded-xl p-4"
        >
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            История изменений
          </h2>
          <div className="space-y-2">
            {lead.statusHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">Нет изменений</p>
            ) : (
              lead.statusHistory.slice(0, 5).map((change) => (
                <div key={change.id} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-foreground text-xs">
                      {change.oldStatus ? (
                        <>
                          <span className={statusLabels[change.oldStatus]?.color}>
                            {statusLabels[change.oldStatus]?.label}
                          </span>
                          {" -> "}
                        </>
                      ) : null}
                      <span className={statusLabels[change.newStatus]?.color}>
                        {statusLabels[change.newStatus]?.label}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {change.changedBy?.name || "Система"} • {new Date(change.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
