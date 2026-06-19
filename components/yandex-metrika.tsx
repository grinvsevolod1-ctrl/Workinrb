"use client"

import Script from "next/script"

export function YandexMetrika({ enabled = true, counterId }: { enabled?: boolean; counterId?: string }) {
  const YM_ID = counterId || process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || ""

  // Не рендерим счётчик, если он отключён в админке или нет ID.
  if (!enabled || !YM_ID) return null

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

          ym(${YM_ID}, 'init', {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            ecommerce: "dataLayer"
          });
        `}
      </Script>
      <noscript>
        <div>
          <img 
            src={`https://mc.yandex.ru/watch/${YM_ID}`}
            style={{ position: "absolute", left: "-9999px" }} 
            alt="" 
          />
        </div>
      </noscript>
    </>
  )
}
