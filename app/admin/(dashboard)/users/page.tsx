"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  UserPlus, 
  Loader2, 
  Shield,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserType {
  id: string
  email: string
  name: string
  role: "ADMIN" | "MANAGER"
  isActive: boolean
  createdAt: string
  _count: { assignedLeads: number; comments: number }
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MANAGER" as "ADMIN" | "MANAGER"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (editingUser) {
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            role: formData.role,
            ...(formData.password && { password: formData.password })
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error)
        }
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error)
        }
      }

      setIsDialogOpen(false)
      setEditingUser(null)
      setFormData({ name: "", email: "", password: "", role: "MANAGER" })
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (user: UserType) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role
    })
    setIsDialogOpen(true)
  }

  const handleToggleActive = async (user: UserType) => {
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      fetchUsers()
    } catch (error) {
      console.error("Failed to toggle user:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteUserId) return
    try {
      await fetch(`/api/admin/users/${deleteUserId}`, { method: "DELETE" })
      fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
    } finally {
      setDeleteUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Пользователи</h1>
          <p className="text-sm text-muted-foreground">Управление доступом</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingUser(null)
            setFormData({ name: "", email: "", password: "", role: "MANAGER" })
            setError(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 w-full sm:w-auto h-9 lg:h-10">
              <UserPlus className="w-4 h-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base lg:text-lg">
                {editingUser ? "Редактировать" : "Новый пользователь"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Имя</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Иван Иванов"
                  required
                  className="h-10"
                />
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                    className="h-10"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  {editingUser ? "Новый пароль" : "Пароль"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "Оставьте пустым" : "Мин. 6 символов"}
                    required={!editingUser}
                    minLength={editingUser ? 0 : 6}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm">Роль</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v as "ADMIN" | "MANAGER" })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANAGER">Менеджер</SelectItem>
                    <SelectItem value="ADMIN">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10">
                  Отмена
                </Button>
                <Button type="submit" disabled={submitting} className="h-10">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingUser ? "Сохранить" : "Создать"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <div className="bg-card border border-border rounded-xl lg:rounded-2xl overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-secondary/30 text-sm font-medium text-muted-foreground border-b border-border">
          <div className="col-span-4">Пользователь</div>
          <div className="col-span-2">Роль</div>
          <div className="col-span-2">Лиды</div>
          <div className="col-span-2">Статус</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        <div className="divide-y divide-border">
          {users.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              {/* Mobile Card View */}
              <div className="lg:hidden p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      u.role === "ADMIN" ? "bg-primary/20" : "bg-secondary"
                    )}>
                      {u.role === "ADMIN" ? (
                        <Shield className="w-5 h-5 text-primary" />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(u)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(u)}>
                        {u.isActive ? (
                          <>
                            <Ban className="w-4 h-4 mr-2" />
                            Заблокировать
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Активировать
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteUserId(u.id)}
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={cn(
                    "inline-flex px-2 py-0.5 rounded-md text-xs font-medium",
                    u.role === "ADMIN" 
                      ? "bg-primary/20 text-primary" 
                      : "bg-secondary text-muted-foreground"
                  )}>
                    {u.role === "ADMIN" ? "Админ" : "Менеджер"}
                  </span>
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                    u.isActive 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-red-500/20 text-red-400"
                  )}>
                    {u.isActive ? "Активен" : "Заблокирован"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {u._count.assignedLeads} лидов
                  </span>
                </div>
              </div>

              {/* Desktop Row View */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-4 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    u.role === "ADMIN" ? "bg-primary/20" : "bg-secondary"
                  )}>
                    {u.role === "ADMIN" ? (
                      <Shield className="w-5 h-5 text-primary" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{u.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={cn(
                    "inline-flex px-2.5 py-1 rounded-lg text-xs font-medium",
                    u.role === "ADMIN" 
                      ? "bg-primary/20 text-primary" 
                      : "bg-secondary text-muted-foreground"
                  )}>
                    {u.role === "ADMIN" ? "Админ" : "Менеджер"}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {u._count.assignedLeads} назначено
                </div>
                <div className="col-span-2">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                    u.isActive 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-red-500/20 text-red-400"
                  )}>
                    {u.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Активен
                      </>
                    ) : (
                      <>
                        <Ban className="w-3 h-3" />
                        Заблокирован
                      </>
                    )}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(u)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(u)}>
                        {u.isActive ? (
                          <>
                            <Ban className="w-4 h-4 mr-2" />
                            Заблокировать
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Активировать
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteUserId(u.id)}
                        className="text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}

          {users.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Пока нет пользователей
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить.
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
    </div>
  )
}
