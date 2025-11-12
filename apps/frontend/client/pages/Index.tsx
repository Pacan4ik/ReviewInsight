import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Upload,
  BarChart3,
  FileText,
  ArrowRight,
  Zap,
  Brain,
  TrendingUp,
} from "lucide-react";

const workflowSteps = [
  {
    number: 1,
    title: "Импорт и управление отзывами",
    description:
      "Собирайте отзывы клиентов из нескольких источников - CSV файлы, API, веб-формы. Автоматически очищайте и подготавливайте данные.",
    icon: Upload,
    href: "/import",
    color: "from-primary-600 to-primary-500",
  },
  {
    number: 2,
    title: "Анализ тональности и тем",
    description:
      "Узнайте, что действительно думают клиенты. Определите тональность, темы, тренды, жалобы и положительные факторы с помощью ИИ.",
    icon: Brain,
    href: "/analysis",
    color: "from-primary-500 to-primary-400",
  },
  {
    number: 3,
    title: "Получите рекомендации",
    description:
      "Превратите инсайты в действия. Получайте рекомендации на основе ИИ, экспортируйте отчёты и отслеживайте метрики для улучшения бизнеса.",
    icon: FileText,
    href: "/reports",
    color: "from-primary-400 to-primary-300",
  },
];

const features = [
  {
    icon: Zap,
    title: "Молниеносная обработка",
    description: "Анализируйте тысячи отзывов за считанные секунды с помощью продвинутых моделей ИИ",
  },
  {
    icon: Brain,
    title: "Инсайты на основе ИИ",
    description:
      "Получайте умные рекомендации на основе тональности и тенденций клиентов",
  },
  {
    icon: TrendingUp,
    title: "Отслеживайте прогресс",
    description:
      "Отслеживайте улучшения во времени с интерактивными панелями и метриками",
  },
];

const stats = [
  { label: "Проанализировано отзывов", value: "50K+", unit: "" },
  { label: "Точность", value: "94%", unit: "" },
  { label: "Скорость обработки", value: "2.3s", unit: "в среднем" },
  { label: "Поддерживаемые языки", value: "42", unit: "" },
];

export default function Index() {
  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-bold text-primary-900 md:text-6xl">
              Превратите отзывы клиентов в{" "}
              <span className="gradient-text">практические инсайты</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-primary-600">
              Review Insight - это платформа на основе ИИ, которая помогает вам понять настроение клиентов, выявить тренды и принять обоснованные решения для улучшения вашего бизнеса.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/import">
              <Button size="lg" className="w-full bg-primary-600 hover:bg-primary-700 sm:w-auto">
                Начать анализ
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-primary-300 text-primary-600 hover:bg-primary-50 sm:w-auto"
            >
              Смотреть демо
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid gap-6 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="card-elevated space-y-2 p-6 text-center">
              <p className="text-sm font-medium text-primary-600">
                {stat.label}
              </p>
              <p className="text-4xl font-bold text-primary-900">{stat.value}</p>
              {stat.unit && (
                <p className="text-xs text-primary-500">{stat.unit}</p>
              )}
            </div>
          ))}
        </section>

        {/* Workflow Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="mb-2 text-4xl font-bold text-primary-900">
              Процесс из трёх этапов
            </h2>
            <p className="text-primary-600">
              От сбора данных до практических инсайтов всего в три простых шага
            </p>
          </div>

          <div className="space-y-6">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Link key={step.href} to={step.href}>
                  <div className="card-elevated group flex cursor-pointer gap-6 p-6 transition-all hover:shadow-xl md:flex-row">
                    <div
                      className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-10 w-10 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="mb-1 inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-600">
                            Этап {step.number}
                          </div>
                          <h3 className="mt-2 text-2xl font-bold text-primary-900">
                            {step.title}
                          </h3>
                          <p className="mt-2 text-primary-600">
                            {step.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="mb-2 text-4xl font-bold text-primary-900">
              Мощные возможности
            </h2>
            <p className="text-primary-600">
              Всё, что вам нужно, чтобы разобраться в отзывах клиентов
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="card-elevated space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-500">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-900">
                    {feature.title}
                  </h3>
                  <p className="text-primary-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 p-8 md:p-12">
          <div className="absolute right-0 top-0 opacity-10">
            <div className="h-40 w-40 rounded-full bg-primary-900" />
          </div>
          <div className="relative space-y-6">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Готовы превратить отзывы клиентов в действия?
            </h2>
            <p className="max-w-xl text-lg text-primary-100">
              Присоединитесь к сотням компаний, которые используют Review Insight для принятия более умных решений на основе инсайтов клиентов.
            </p>
            <Link to="/import">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                Начните анализ сегодня
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
