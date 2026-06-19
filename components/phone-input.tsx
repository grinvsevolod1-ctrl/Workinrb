"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { parsePhoneNumber, isValidPhoneNumber, getCountryCallingCode, type CountryCode } from "libphonenumber-js"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, Search, X, Phone } from "lucide-react"

interface SmartPhoneInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  name?: string
  required?: boolean
  className?: string
}

// SVG флаги стран
const FLAGS: Record<string, React.ReactNode> = {
  BY: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#b20000" d="M0 0h640v480H0z"/>
      <path fill="#4aa839" d="M0 320h640v160H0z"/>
      <path fill="#fff" d="M0 0h90v480H0z"/>
      <g fill="#b20000">
        <path d="M30 0h15v480H30z"/>
        <path d="M60 0h15v480H60z"/>
      </g>
    </svg>
  ),
  RU: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#fff" d="M0 0h640v160H0z"/>
      <path fill="#0039a6" d="M0 160h640v160H0z"/>
      <path fill="#d52b1e" d="M0 320h640v160H0z"/>
    </svg>
  ),
  UA: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#005bbb" d="M0 0h640v240H0z"/>
      <path fill="#ffd500" d="M0 240h640v240H0z"/>
    </svg>
  ),
  KZ: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#00afca" d="M0 0h640v480H0z"/>
      <path fill="#fec50c" d="M0 200h640v80H0z"/>
    </svg>
  ),
  UZ: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#1eb53a" d="M0 320h640v160H0z"/>
      <path fill="#0099b5" d="M0 0h640v160H0z"/>
      <path fill="#ce1126" d="M0 153h640v6H0zm0 168h640v6H0z"/>
      <path fill="#fff" d="M0 159h640v162H0z"/>
    </svg>
  ),
  MD: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#00319c" d="M0 0h213.3v480H0z"/>
      <path fill="#ffde00" d="M213.3 0h213.4v480H213.3z"/>
      <path fill="#de2110" d="M426.7 0H640v480H426.7z"/>
    </svg>
  ),
  AZ: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#3f9c35" d="M0 320h640v160H0z"/>
      <path fill="#ed2939" d="M0 160h640v160H0z"/>
      <path fill="#00b9e4" d="M0 0h640v160H0z"/>
    </svg>
  ),
  AM: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#d90012" d="M0 0h640v160H0z"/>
      <path fill="#0033a0" d="M0 160h640v160H0z"/>
      <path fill="#f2a800" d="M0 320h640v160H0z"/>
    </svg>
  ),
  GE: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#fff" d="M0 0h640v480H0z"/>
      <path fill="#ff0000" d="M272 0h96v480h-96zM0 192h640v96H0z"/>
    </svg>
  ),
  KG: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#e8112d" d="M0 0h640v480H0z"/>
      <circle cx="320" cy="240" r="80" fill="#ffef00"/>
    </svg>
  ),
  TJ: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#060" d="M0 320h640v160H0z"/>
      <path fill="#fff" d="M0 160h640v160H0z"/>
      <path fill="#c00" d="M0 0h640v160H0z"/>
    </svg>
  ),
  TM: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#00843d" d="M0 0h640v480H0z"/>
      <path fill="#c00" d="M100 0h100v480H100z"/>
    </svg>
  ),
  LT: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#006a44" d="M0 320h640v160H0z"/>
      <path fill="#c1272d" d="M0 160h640v160H0z"/>
      <path fill="#fdb913" d="M0 0h640v160H0z"/>
    </svg>
  ),
  LV: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#9e3039" d="M0 0h640v480H0z"/>
      <path fill="#fff" d="M0 192h640v96H0z"/>
    </svg>
  ),
  EE: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#4891d9" d="M0 0h640v160H0z"/>
      <path fill="#000" d="M0 160h640v160H0z"/>
      <path fill="#fff" d="M0 320h640v160H0z"/>
    </svg>
  ),
  PL: (
    <svg viewBox="0 0 640 480" className="w-6 h-4 rounded-sm shadow-sm">
      <path fill="#fff" d="M0 0h640v240H0z"/>
      <path fill="#dc143c" d="M0 240h640v240H0z"/>
    </svg>
  ),
}

// Страны с названиями и кодами
const COUNTRIES: { code: CountryCode; name: string; nameEn: string; dialCode: string }[] = [
  { code: "BY", name: "Беларусь", nameEn: "Belarus", dialCode: "375" },
  { code: "RU", name: "Россия", nameEn: "Russia", dialCode: "7" },
  { code: "UA", name: "Украина", nameEn: "Ukraine", dialCode: "380" },
  { code: "KZ", name: "Казахстан", nameEn: "Kazakhstan", dialCode: "7" },
  { code: "UZ", name: "Узбекистан", nameEn: "Uzbekistan", dialCode: "998" },
  { code: "MD", name: "Молдова", nameEn: "Moldova", dialCode: "373" },
  { code: "AZ", name: "Азербайджан", nameEn: "Azerbaijan", dialCode: "994" },
  { code: "AM", name: "Армения", nameEn: "Armenia", dialCode: "374" },
  { code: "GE", name: "Грузия", nameEn: "Georgia", dialCode: "995" },
  { code: "KG", name: "Кыргызстан", nameEn: "Kyrgyzstan", dialCode: "996" },
  { code: "TJ", name: "Таджикистан", nameEn: "Tajikistan", dialCode: "992" },
  { code: "TM", name: "Туркменистан", nameEn: "Turkmenistan", dialCode: "993" },
  { code: "LT", name: "Литва", nameEn: "Lithuania", dialCode: "370" },
  { code: "LV", name: "Латвия", nameEn: "Latvia", dialCode: "371" },
  { code: "EE", name: "Эстония", nameEn: "Estonia", dialCode: "372" },
  { code: "PL", name: "Польша", nameEn: "Poland", dialCode: "48" },
]

// Поиск страны по коду телефона
function findCountryByDialCode(dialCode: string): CountryCode | null {
  // Приоритет для BY и UA при коде 7 (RU и KZ имеют один код)
  if (dialCode === "375") return "BY"
  if (dialCode === "380") return "UA"
  if (dialCode.startsWith("7")) {
    // Казахстан: +7 7XX
    if (dialCode.length >= 2 && dialCode[1] === "7") return "KZ"
    return "RU"
  }
  
  const country = COUNTRIES.find(c => dialCode.startsWith(c.dialCode))
  return country?.code || null
}

export function SmartPhoneInput({
  value,
  onChange,
  id,
  name,
  required,
  className,
}: SmartPhoneInputProps) {
  const [country, setCountry] = useState<CountryCode>("BY")
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isTouched, setIsTouched] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const skipAutoDetect = useRef(false)

  // BY по умолчанию - убрали ipapi.co из-за rate limits

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Фокус на поиске при открытии
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Валидация номера
  const validateAndUpdate = useCallback((phone: string) => {
    if (!phone || phone.replace(/\D/g, "").length < 5) {
      setIsValid(null)
      return
    }
    
    try {
      const fullNumber = phone.startsWith("+") ? phone : `+${phone}`
      const valid = isValidPhoneNumber(fullNumber)
      setIsValid(valid)
      
      if (valid) {
        onChange(fullNumber)
      } else {
        onChange(phone.startsWith("+") ? phone : `+${phone}`)
      }
    } catch {
      setIsValid(false)
      onChange(phone.startsWith("+") ? phone : `+${phone}`)
    }
  }, [onChange])

  // Форматирование номера для отображения
  const formatDisplayValue = (val: string): string => {
    const digits = val.replace(/\D/g, "")
    if (!digits) return ""
    
    // Формат с кодом страны: +XXX XX XXX-XX-XX
    let result = ""
    let idx = 0
    
    // Добавляем код страны (от 1 до 3 цифр)
    const dialCodeLen = country === "RU" || country === "KZ" ? 1 : 
                        country === "PL" ? 2 : 3
    
    if (digits.length > 0) {
      result = digits.slice(0, Math.min(dialCodeLen, digits.length))
      idx = result.length
    }
    
    // Добавляем остальные цифры с форматированием
    if (idx < digits.length) {
      result += " "
      // Код оператора (2-3 цифры)
      const opLen = Math.min(3, digits.length - idx)
      result += digits.slice(idx, idx + opLen)
      idx += opLen
    }
    
    if (idx < digits.length) {
      result += " "
      const partLen = Math.min(3, digits.length - idx)
      result += digits.slice(idx, idx + partLen)
      idx += partLen
    }
    
    if (idx < digits.length) {
      result += "-"
      const partLen = Math.min(2, digits.length - idx)
      result += digits.slice(idx, idx + partLen)
      idx += partLen
    }
    
    if (idx < digits.length) {
      result += "-"
      result += digits.slice(idx, idx + 2)
    }
    
    return result
  }

  // Обработка ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    
    // Разрешаем +, цифры, пробелы и дефисы
    val = val.replace(/[^\d\s\-+]/g, "")
    
    // Убираем + если он не в начале
    if (val.indexOf("+") > 0) {
      val = val.replace(/\+/g, "")
    }
    
    // Если начинается с +, убираем его для обработки
    const hasPlus = val.startsWith("+")
    const digits = val.replace(/\D/g, "")
    
    if (!digits) {
      setInputValue("")
      setIsValid(null)
      onChange("")
      return
    }
    
    // Автоопределение страны по введенному коду
    if (!skipAutoDetect.current && digits.length >= 1) {
      const detected = findCountryByDialCode(digits)
      if (detected && detected !== country) {
        setCountry(detected)
      }
    }
    
    // Ограничиваем длину (код страны + 10-12 цифр номера)
    const maxLen = 15
    const limitedDigits = digits.slice(0, maxLen)
    
    // Форматируем для отображения
    const formatted = formatDisplayValue(limitedDigits)
    setInputValue(hasPlus ? "+" + formatted : "+" + formatted)
    
    // Валидируем и отправляем в родителя
    validateAndUpdate("+" + limitedDigits)
  }

  // Выбор страны из списка
  const handleCountrySelect = (countryCode: CountryCode) => {
    const prevCountry = country
    setCountry(countryCode)
    setIsOpen(false)
    setSearchQuery("")
    
    // Заменяем код страны в номере
    const dialCode = COUNTRIES.find(c => c.code === countryCode)?.dialCode || ""
    const prevDialCode = COUNTRIES.find(c => c.code === prevCountry)?.dialCode || ""
    
    let currentDigits = inputValue.replace(/\D/g, "")
    
    // Убираем старый код страны если он есть
    if (currentDigits.startsWith(prevDialCode)) {
      currentDigits = currentDigits.slice(prevDialCode.length)
    }
    
    // Добавляем новый код
    const newDigits = dialCode + currentDigits
    const formatted = formatDisplayValue(newDigits)
    
    skipAutoDetect.current = true
    setInputValue("+" + formatted)
    validateAndUpdate("+" + newDigits)
    
    setTimeout(() => {
      skipAutoDetect.current = false
      inputRef.current?.focus()
    }, 50)
  }

  // Поиск страны
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
    searchInputRef.current?.focus()
  }

  // Фильтрация стран
  const filteredCountries = COUNTRIES.filter(c => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      c.name.toLowerCase().includes(query) ||
      c.nameEn.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.dialCode.includes(query) ||
      ("+" + c.dialCode).includes(query)
    )
  })

  const hasValue = inputValue.replace(/\D/g, "").length > 0
  const showError = isTouched && hasValue && isValid === false
  const showSuccess = isTouched && hasValue && isValid === true

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Main container */}
      <div 
        className={cn(
          "relative flex items-stretch rounded-xl overflow-hidden transition-all duration-300",
          "bg-secondary/40 border-2",
          isFocused 
            ? "border-primary/60 shadow-[0_0_20px_rgba(34,197,94,0.15)]" 
            : "border-border/40 hover:border-border/60",
          showError && "border-red-400/60 shadow-[0_0_20px_rgba(248,113,113,0.1)]",
          showSuccess && "border-green-500/60 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
        )}
      >
        {/* Country selector */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Выбрать страну"
          aria-expanded={isOpen}
          className={cn(
            "flex items-center gap-2 px-3 sm:px-4 h-12 sm:h-14 transition-all duration-200",
            "bg-secondary/30 hover:bg-secondary/50",
            "border-r border-border/30",
            "group"
          )}
        >
          <div className="relative">
            {FLAGS[country]}
            <motion.div 
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background"
              initial={false}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              key={country}
            />
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute top-full left-0 mt-2 w-[calc(100%+2rem)] sm:w-80 bg-card/98 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden"
              >
                {/* Search header */}
                <div className="p-3 bg-secondary/30 border-b border-border/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Поиск страны или кода..."
                      className="w-full h-11 pl-10 pr-10 bg-background/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          type="button"
                          onClick={clearSearch}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Country list */}
                <div className="max-h-72 overflow-y-auto overscroll-contain">
                  {filteredCountries.length > 0 ? (
                    <div className="py-1">
                      {filteredCountries.map((c, index) => (
                        <motion.button
                          key={c.code}
                          type="button"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.15 }}
                          onClick={() => handleCountrySelect(c.code)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150",
                            "hover:bg-primary/10",
                            c.code === country && "bg-primary/15"
                          )}
                        >
                          <span className="flex-shrink-0">{FLAGS[c.code]}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{c.name}</div>
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">+{c.dialCode}</div>
                          {c.code === country && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <Check className="w-4 h-4 text-primary" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-10 text-center">
                      <Phone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Страна не найдена</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Phone input */}
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="tel"
            id={id}
            name={name}
            required={required}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false)
              setIsTouched(true)
            }}
            className={cn(
              "w-full h-12 sm:h-14 bg-transparent text-foreground",
              "text-base sm:text-lg font-medium tracking-wide",
              "focus:outline-none",
              "px-4 pr-12",
              "transition-all duration-200"
            )}
            placeholder="+375 XX XXX-XX-XX"
            autoComplete="tel"
          />

          {/* Validation indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AnimatePresence mode="wait">
              {isTouched && hasValue && isValid !== null && (
                <motion.div
                  key={isValid ? "valid" : "invalid"}
                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {isValid ? (
                    <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center ring-2 ring-green-500/30">
                      <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-red-400/20 flex items-center justify-center ring-2 ring-red-400/30">
                      <X className="w-4 h-4 text-red-400" strokeWidth={3} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-red-400 mt-2 pl-1 flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Введите корректный номер телефона
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export { isValidPhoneNumber }
