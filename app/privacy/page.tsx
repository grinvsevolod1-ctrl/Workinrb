import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Политика конфиденциальности | WorkInRB",
  description: "Политика конфиденциальности сайта workinrb.top",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>На главную</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
          Политика конфиденциальности
        </h1>

        <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
          <p className="text-muted-foreground text-base sm:text-lg mb-6">
            Последнее обновление: январь 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">1. Общие положения</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
              пользователей сайта workinrb.top (далее — Сайт).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Используя Сайт и предоставляя свои персональные данные, вы соглашаетесь с условиями данной Политики.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">2. Какие данные мы собираем</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Мы можем собирать следующие персональные данные:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Имя</li>
              <li>Номер телефона</li>
              <li>Город проживания</li>
              <li>Техническая информация (IP-адрес, тип браузера, время посещения)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">3. Цели сбора данных</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Персональные данные используются для:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Связи с вами по вопросам трудоустройства</li>
              <li>Обработки заявок на работу</li>
              <li>Улучшения качества работы Сайта</li>
              <li>Статистического анализа посещаемости</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">4. Защита данных</h2>
            <p className="text-muted-foreground leading-relaxed">
              Мы принимаем необходимые организационные и технические меры для защиты ваших персональных данных 
              от несанкционированного доступа, изменения, раскрытия или уничтожения.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">5. Передача данных третьим лицам</h2>
            <p className="text-muted-foreground leading-relaxed">
              Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением случаев, 
              предусмотренных законодательством Российской Федерации.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">6. Файлы cookie</h2>
            <p className="text-muted-foreground leading-relaxed">
              Сайт использует файлы cookie для сбора статистики посещаемости (Яндекс.Метрика). 
              Вы можете отключить cookie в настройках браузера, однако это может повлиять на функциональность Сайта.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">7. Ваши права</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Вы имеете право:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Запросить информацию о хранящихся персональных данных</li>
              <li>Потребовать удаления ваших персональных данных</li>
              <li>Отозвать согласие на обработку персональных данных</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">8. Контакты</h2>
            <p className="text-muted-foreground leading-relaxed">
              По всем вопросам, связанным с обработкой персональных данных, вы можете связаться с нами 
              через форму обратной связи на сайте или через Instagram: @workinrb
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
