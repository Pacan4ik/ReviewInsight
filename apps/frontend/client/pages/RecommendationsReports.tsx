import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Lightbulb, BarChart3, FileText, TrendingUp } from "lucide-react";

const recommendations = [
  {
    priority: "High",
    title: "Реализуйте более быструю доставку",
    description:
      "42% жалоб упоминают задержки доставки. Предложение экспресс-доставки может улучшить удовлетворённость на 15-20%.",
    impact: "Удовлетворённость +18%",
    effort: "Среднее",
  },
  {
    priority: "High",
    title: "Улучшите контроль качества",
    description:
      "Повреждённые товары при доставке - вторая по частоте жалоба (38 упоминаний). Усиливайте процедуры контроля качества.",
    impact: "Возвраты -25%",
    effort: "Высокое",
  },
  {
    priority: "Medium",
    title: "Улучшите описания товаров",
    description:
      "Неясные описания товаров упоминаются в 23% отзывов. Добавьте детальные спецификации и изображения.",
    impact: "Возвраты -12%",
    effort: "Низкое",
  },
  {
    priority: "Medium",
    title: "Расширьте часы поддержки",
    description:
      "Сложно связаться с поддержкой упоминается 28 раз. Поддержка 24/7 или чатбот помогли бы решить эту проблему.",
    impact: "Удовлетворённость поддержкой +22%",
    effort: "Среднее",
  },
  {
    priority: "Low",
    title: "Создайте программу лояльности",
    description:
      "Клиентам нравится хорошее соотношение цены и качества. Программа вознаграждений может увеличить удержание на 10%.",
    impact: "Удержание +10%",
    effort: "Среднее",
  },
];

const executiveSummary = {
  totalReviews: 1247,
  avgRating: 4.2,
  sentimentPositive: "45%",
  sentimentNegative: "25%",
  mainChallenges: [
    "Скорость доставки (234 упоминания)",
    "Повреждение товара (198 упоминаний)",
    "Неясные описания (154 упоминания)",
  ],
  strengths: [
    "Высокое восприятие качества товара",
    "Профессиональное обслуживание",
    "Хорос предложение ценности",
  ],
  timeframe: "1 января - 31 декабря 2024 г.",
};

export default function RecommendationsReports() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary-900">
            Рекомендации и отчёты
          </h1>
          <p className="text-lg text-primary-600">
            Инсайты на основе ИИ и практические рекомендации по результатам анализа отзывов
          </p>
        </div>

        {/* Export Options */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1 bg-primary-600 hover:bg-primary-700 sm:flex-none">
            <Download className="h-4 w-4" />
            Экспортировать в PDF
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            Экспортировать в Excel
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            Скачать отчёт
          </Button>
        </div>

        {/* Executive Summary */}
        <div className="card-elevated space-y-6 p-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-primary-900">
            <BarChart3 className="h-6 w-6" />
            Краткое резюме
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4">
              <p className="text-sm font-medium text-primary-600">
                Период анализа
              </p>
              <p className="mt-2 text-lg font-bold text-primary-900">
                {executiveSummary.timeframe}
              </p>
            </div>
            <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4">
              <p className="text-sm font-medium text-primary-600">
                Проанализировано отзывов
              </p>
              <p className="mt-2 text-lg font-bold text-primary-900">
                {executiveSummary.totalReviews}
              </p>
            </div>
            <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4">
              <p className="text-sm font-medium text-primary-600">
                Средний рейтинг
              </p>
              <p className="mt-2 text-lg font-bold text-primary-900">
                {executiveSummary.avgRating}/5.0
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-primary-900">Основные проблемы</h3>
              <div className="space-y-2">
                {executiveSummary.mainChallenges.map((challenge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-primary-700"
                  >
                    <div className="h-2 w-2 rounded-full bg-orange-600" />
                    {challenge}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-primary-900">Сильные стороны</h3>
              <div className="space-y-2">
                {executiveSummary.strengths.map((strength, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-primary-700"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-600" />
                    {strength}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card-elevated space-y-6 p-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-primary-900">
            <Lightbulb className="h-6 w-6" />
            Рекомендации на основе ИИ
          </h2>

          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-primary-200 bg-white p-5 transition-all hover:shadow-md"
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          rec.priority === "High"
                            ? "bg-orange-100 text-orange-700"
                            : rec.priority === "Medium"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {rec.priority === "High"
                          ? "Высокий приоритет"
                          : rec.priority === "Medium"
                            ? "Средний приоритет"
                            : "Низкий приоритет"}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-primary-900">
                      {rec.title}
                    </h3>
                  </div>
                </div>

                <p className="mb-4 text-primary-700">{rec.description}</p>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {rec.impact}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-primary-600">
                        Трудозатратность: <span className="font-medium">{rec.effort}</span>
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary-300 text-primary-600 hover:bg-primary-50"
                  >
                    Подробнее
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="card-elevated space-y-6 p-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-primary-900">
            <FileText className="h-6 w-6" />
            Панель ключевых метрик
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-primary-900">Здоровье тональности</h3>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-primary-600">Позитивные</span>
                    <span className="font-medium text-primary-900">45%</span>
                  </div>
                  <div className="h-2 rounded-full bg-primary-100">
                    <div
                      className="h-full rounded-full bg-green-600"
                      style={{ width: "45%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-primary-600">Нейтральные</span>
                    <span className="font-medium text-primary-900">30%</span>
                  </div>
                  <div className="h-2 rounded-full bg-primary-100">
                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{ width: "30%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-primary-600">Негативные</span>
                    <span className="font-medium text-primary-900">25%</span>
                  </div>
                  <div className="h-2 rounded-full bg-primary-100">
                    <div
                      className="h-full rounded-full bg-orange-600"
                      style={{ width: "25%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-primary-900">
                Показатели производительности
              </h3>
              <div className="space-y-3">
                <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-3">
                  <p className="text-sm text-primary-600">Уровень разрешения</p>
                  <p className="mt-1 text-2xl font-bold text-primary-900">
                    87%
                  </p>
                </div>
                <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-3">
                  <p className="text-sm text-primary-600">Время отклика</p>
                  <p className="mt-1 text-2xl font-bold text-primary-900">
                    2.3ч в среднем
                  </p>
                </div>
                <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-3">
                  <p className="text-sm text-primary-600">
                    Тренд удовлетворённости клиентов
                  </p>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    ↑ +12%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="card-elevated space-y-4 p-6">
          <h2 className="text-lg font-semibold text-primary-900">
            Рекомендуемые следующие шаги
          </h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                1
              </span>
              <span className="text-primary-900">
                Организуйте встречу с командой продукта для обсуждения рекомендаций с высоким приоритетом
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                2
              </span>
              <span className="text-primary-900">
                Создайте план действий по улучшению доставки (инициатива с наибольшим влиянием)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                3
              </span>
              <span className="text-primary-900">
                Внедрите быстрые выигрыши (улучшение описания товаров)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                4
              </span>
              <span className="text-primary-900">
                Ежемесячно отслеживайте метрики и корректируйте стратегии
              </span>
            </li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
