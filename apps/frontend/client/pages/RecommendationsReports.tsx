import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Lightbulb, BarChart3, FileText, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";  // <--- НОВОЕ


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

type FeedbackAnalysis = {
  prio: string;
  problem: string;
  proposal_text: string;
};

type FeedbackReportResponse = {
  feedback_analysis: FeedbackAnalysis;
  proposal_text: string; // строка с шагами, разделёнными ";"
};



export default function RecommendationsReports() {
  const [feedbackReport, setFeedbackReport] = useState<FeedbackReportResponse | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setFeedbackLoading(true);
        setFeedbackError(null);

        // Можно через env-переменную, чтобы не хардкодить бэкенд-URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
        const resp = await fetch(`${baseUrl}/api/recommendations/feedback-report`);

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }

        const data: FeedbackReportResponse = await resp.json();
        setFeedbackReport(data);
      } catch (e) {
        console.error(e);
        setFeedbackError("Не удалось загрузить рекомендации от ИИ");
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchFeedback();
  }, []);
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

          {feedbackLoading && (
            <p className="text-primary-600">Загружаем рекомендации от ИИ…</p>
          )}

          {feedbackError && (
            <p className="text-sm text-red-600">{feedbackError}</p>
          )}

          {!feedbackLoading && !feedbackError && feedbackReport && (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary-200 bg-white p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold uppercase text-amber-800">
                    Приоритет: {feedbackReport.feedback_analysis.prio}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-primary-900">
                  Проблема: {feedbackReport.feedback_analysis.problem}
                </h3>

                <p className="text-primary-700">
                  {feedbackReport.feedback_analysis.proposal_text}
                </p>
              </div>
            </div>
          )}
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

          {feedbackLoading && (
            <p className="text-primary-600">Формируем план действий…</p>
          )}

          {feedbackError && (
            <p className="text-sm text-red-600">
              {feedbackError}
            </p>
          )}

          {!feedbackLoading && !feedbackError && feedbackReport && (
            <ol className="space-y-3">
              {feedbackReport.proposal_text
                .split(";")
                .map((step) => step.trim())
                .filter(Boolean)
                .map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-primary-900">{step}</span>
                  </li>
                ))}
            </ol>
          )}
        </div>

      </div>
    </Layout>
  );
}
