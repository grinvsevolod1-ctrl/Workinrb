import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Условия использования | WorkInRB",
  description: "Условия использования сайта workinrb.top",
}

export default function TermsPage() {
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
          Условия использования
        </h1>

        <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
          <p className="text-muted-foreground text-base sm:text-lg mb-6">
            Последнее обновление: январь 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">1. Общие положения</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Настоящие Условия использования регулируют порядок использования сайта workinrb.top (далее — Сайт).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Используя Сайт, вы подтверждаете, что ознакомились с данными Условиями и принимаете их в полном объеме.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">2. Описание услуг</h2>
            <p className="text-muted-foreground leading-relaxed">
              Сайт предоставляет информацию о вакансиях на подсобные работы в Москве и Московской области, 
              а также возможность оставить заявку на трудоустройство. Сайт не является кадровым агентством 
              и не взимает плату с соискателей.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">3. Требования к соискателям</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Вакансии предназначены для:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Мужчин от 18 до 55 лет</li>
              <li>Граждан Республики Беларусь</li>
              <li>Лиц без вредных привычек (алкогольная и наркотическая зависимость)</li>
              <li>Готовых к физическому труду на открытом воздухе</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">4. Условия работы</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Информация на Сайте носит ознакомительный характер. Точные условия труда, оплаты и проживания 
              обсуждаются индивидуально при оформлении на работу и фиксируются в трудовом договоре.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Мы оставляем за собой право изменять условия без предварительного уведомления на Сайте.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">5. Ограничение ответственности</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Администрация Сайта не несет ответственности за:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Технические сбои в работе Сайта</li>
              <li>Действия третьих лиц</li>
              <li>Убытки, связанные с использованием информации с Сайта</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">6. Интеллектуальная собственность</h2>
            <p className="text-muted-foreground leading-relaxed">
              Все материалы Сайта (тексты, изображения, логотипы) являются собственностью администрации Сайта. 
              Копирование и распространение материалов без письменного согласия запрещено.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">7. Изменение условий</h2>
            <p className="text-muted-foreground leading-relaxed">
              Мы оставляем за собой право изменять данные Условия в любое время. Продолжение использования 
              Сайта после внесения изменений означает ваше согласие с новой редакцией Условий.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">8. Применимое право</h2>
            <p className="text-muted-foreground leading-relaxed">
              Настоящие Условия регулируются законодательством Российской Федерации. 
              Все споры разрешаются в соответствии с действующим законодательством РФ.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
