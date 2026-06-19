"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Bell,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

interface TelegramChat {
  id: string
  chatId: string
  name: string
  type: "MANAGER" | "GROUP"
  isActive: boolean
  createdAt: string
  leadCount?: number
}

export default function TelegramSettingsPage() {
  const router = useRouter()
  const [chats, setChats] = useState<TelegramChat[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Форма добавления
  const [newChatId, setNewChatId] = useState("")
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<"MANAGER" | "GROUP">("MANAGER")

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/telegram/webhook`
    : ''

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/admin/telegram-chats")
      if (res.status === 403) {
        router.push("/admin")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setChats(data.chats || [])
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChat = async () => {
    if (!newChatId.trim() || !newName.trim()) return
    
    setAdding(true)
    try {
      const res = await fetch("/api/admin/telegram-chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: newChatId.trim(),
          name: newName.trim(),
          type: newType
        })
      })
      
      if (res.ok) {
        setAddDialogOpen(false)
        setNewChatId("")
        setNewName("")
        setNewType("MANAGER")
        fetchChats()
      } else {
        const data = await res.json()
        alert(data.error || "Ошибка добавления")
      }
    } catch (error) {
      console.error("Failed to add chat:", error)
    } finally {
      setAdding(false)
    }
  }

  const handleToggleActive = async (chat: TelegramChat) => {
    try {
      await fetch(`/api/admin/telegram-chats/${chat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !chat.isActive })
      })
      fetchChats()
    } catch (error) {
      console.error("Failed to toggle chat:", error)
    }
  }

  const handleChangeType = async (chat: TelegramChat, newType: "MANAGER" | "GROUP") => {
    try {
      await fetch(`/api/admin/telegram-chats/${chat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType })
      })
      fetchChats()
    } catch (error) {
      console.error("Failed to change type:", error)
    }
  }

  const handleDeleteChat = async (id: string) => {
    try {
      await fetch(`/api/admin/telegram-chats/${id}`, { method: "DELETE" })
      fetchChats()
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Send className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Telegram уведомления
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Настройка чатов для уведомлений о новых лидах
          </p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Добавить чат
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Добавить Telegram чат</DialogTitle>
              <DialogDescription>
                Добавьте чат или группу для получения уведомлений о лидах
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="chatId">Chat ID</Label>
                <Input
                  id="chatId"
                  value={newChatId}
                  onChange={(e) => setNewChatId(e.target.value)}
                  placeholder="-1001234567890"
                />
                <p className="text-xs text-muted-foreground">
                  Получите Chat ID через @userinfobot или @RawDataBot
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Рабочий чат"
                />
              </div>
              <div className="space-y-2">
                <Label>Тип чата</Label>
                <Select value={newType} onValueChange={(v: "MANAGER" | "GROUP") => setNewType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANAGER">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Менеджер (уведомления)
                      </div>
                    </SelectItem>
                    <SelectItem value="GROUP">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Группа (с кнопками)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Интерактивный чат позволяет менять статус и комментировать прямо в Telegram
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddChat} 
                disabled={adding || !newChatId.trim() || !newName.trim()}
                className="w-full sm:w-auto"
              >
                {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhook URL Info */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-4 h-4" />
            Настройка Webhook (для интерактивных кнопок)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Чтобы кнопки в Telegram работали, настройте webhook для вашего бота:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 bg-secondary/50 px-3 py-2 rounded text-xs sm:text-sm break-all">
              {webhookUrl}
            </code>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyWebhookUrl}
              className="shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Выполните команду: <code className="bg-secondary/50 px-1 rounded">curl "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url={webhookUrl}"</code>
          </p>
        </CardContent>
      </Card>

      {/* Chats List */}
      <div className="grid gap-3 sm:gap-4">
        {chats.length === 0 ? (
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <Send className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/30 mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">Чаты не добавлены</p>
              <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
                Добавьте Telegram чат для получения уведомлений
              </p>
            </CardContent>
          </Card>
        ) : (
          chats.map((chat) => (
            <Card key={chat.id} className={!chat.isActive ? "opacity-60" : ""}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Icon & Info */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      chat.type === 'GROUP' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {chat.type === 'GROUP' ? (
                        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm sm:text-base truncate">{chat.name}</span>
                        {chat.type === 'GROUP' && (
                          <span className="text-[10px] sm:text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                            Группа
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">
                        ID: {chat.chatId} {chat.leadCount ? `• ${chat.leadCount} лидов` : ''}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                    {/* Type selector */}
                    <Select 
                      value={chat.type} 
                      onValueChange={(v: "MANAGER" | "GROUP") => handleChangeType(chat, v)}
                    >
                      <SelectTrigger className="w-[130px] sm:w-[160px] h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANAGER">Менеджер</SelectItem>
                        <SelectItem value="GROUP">Группа</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggleActive(chat)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title={chat.isActive ? "Отключить" : "Включить"}
                    >
                      {chat.isActive ? (
                        <ToggleRight className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 sm:w-7 sm:h-7" />
                      )}
                    </button>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-muted-foreground hover:text-red-400 transition-colors p-1">
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить чат?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Чат "{chat.name}" будет удален. Уведомления больше не будут приходить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="mt-0">Отмена</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteChat(chat.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Help */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base">Как получить Chat ID?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm text-muted-foreground">
          <div className="space-y-2">
            <p><strong>Для личного чата:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Напишите боту @userinfobot или @RawDataBot</li>
              <li>Скопируйте ваш ID</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p><strong>Для группы:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Добавьте @RawDataBot в группу</li>
              <li>Напишите любое сообщение</li>
              <li>Бот ответит с ID группы (начинается с -100)</li>
              <li>Удалите бота из группы</li>
            </ol>
          </div>
          <div className="pt-2">
            <a 
              href="https://t.me/RawDataBot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Открыть @RawDataBot
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
