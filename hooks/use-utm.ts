"use client"

import { useEffect, useState } from "react"

export interface UTMParams {
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
}

// Получение cookie по имени
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

// Сохранение UTM в sessionStorage (чтобы не потерять при переходах)
function saveUTMToStorage(params: Partial<UTMParams>) {
  if (typeof sessionStorage === "undefined") return
  const existing = getUTMFromStorage()
  const merged = { ...existing, ...params }
  sessionStorage.setItem("utm_params", JSON.stringify(merged))
}

function getUTMFromStorage(): Partial<UTMParams> {
  if (typeof sessionStorage === "undefined") return {}
  try {
    const stored = sessionStorage.getItem("utm_params")
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function useUTM(): UTMParams {
  const [params, setParams] = useState<UTMParams>({
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    fbclid: null,
    fbp: null,
    fbc: null,
    referrer: null,
    landingPage: null,
    userAgent: null,
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    
    // Собираем UTM из URL
    const utmFromUrl: Partial<UTMParams> = {
      utmSource: urlParams.get("utm_source"),
      utmMedium: urlParams.get("utm_medium"),
      utmCampaign: urlParams.get("utm_campaign"),
      utmTerm: urlParams.get("utm_term"),
      utmContent: urlParams.get("utm_content"),
      fbclid: urlParams.get("fbclid"),
    }

    // Получаем Facebook cookies
    const fbp = getCookie("_fbp")
    const fbc = getCookie("_fbc") || (utmFromUrl.fbclid ? `fb.1.${Date.now()}.${utmFromUrl.fbclid}` : null)

    // Дополнительные данные
    const additionalData: Partial<UTMParams> = {
      fbp,
      fbc,
      referrer: document.referrer || null,
      landingPage: window.location.pathname + window.location.search,
      userAgent: navigator.userAgent,
    }

    // Объединяем с сохраненными данными
    const storedParams = getUTMFromStorage()
    
    // URL параметры имеют приоритет над сохраненными
    const finalParams: UTMParams = {
      utmSource: utmFromUrl.utmSource || storedParams.utmSource || null,
      utmMedium: utmFromUrl.utmMedium || storedParams.utmMedium || null,
      utmCampaign: utmFromUrl.utmCampaign || storedParams.utmCampaign || null,
      utmTerm: utmFromUrl.utmTerm || storedParams.utmTerm || null,
      utmContent: utmFromUrl.utmContent || storedParams.utmContent || null,
      fbclid: utmFromUrl.fbclid || storedParams.fbclid || null,
      fbp: additionalData.fbp || storedParams.fbp || null,
      fbc: additionalData.fbc || storedParams.fbc || null,
      referrer: storedParams.referrer || additionalData.referrer || null, // Сохраняем первый referrer
      landingPage: storedParams.landingPage || additionalData.landingPage || null, // Сохраняем первую страницу
      userAgent: additionalData.userAgent || null,
    }

    // Сохраняем в storage
    saveUTMToStorage(finalParams)
    
    setParams(finalParams)
  }, [])

  return params
}

// Функция для получения UTM без хука (для использования в обработчиках)
export function getUTMParams(): UTMParams {
  if (typeof window === "undefined") {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
      fbclid: null,
      fbp: null,
      fbc: null,
      referrer: null,
      landingPage: null,
      userAgent: null,
    }
  }
  
  const stored = getUTMFromStorage()
  
  return {
    utmSource: stored.utmSource || null,
    utmMedium: stored.utmMedium || null,
    utmCampaign: stored.utmCampaign || null,
    utmTerm: stored.utmTerm || null,
    utmContent: stored.utmContent || null,
    fbclid: stored.fbclid || null,
    fbp: stored.fbp || null,
    fbc: stored.fbc || null,
    referrer: stored.referrer || null,
    landingPage: stored.landingPage || null,
    userAgent: navigator.userAgent || null,
  }
}
