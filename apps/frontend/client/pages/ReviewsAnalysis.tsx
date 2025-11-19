import { Layout } from "@/components/Layout";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, AlertCircle, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

const sentimentData = [];
const sentimentTimeline = [];
const topicsData = [];
const commonComplaints = [];
const positiveAspects = [];

const defaultSentimentData = [
  { name: "Позитивные", value: 45, color: "#00b4d8" },
  { name: "Нейтральные", value: 30, color: "#90e0ef" },
  { name: "Негативные", value: 25, color: "#0096c7" },
];

const defaultSentimentTimeline = [
  { date: "Неделя 1", positive: 35, neutral: 28, negative: 37 },
  { date: "Неделя 2", positive: 38, neutral: 30, negative: 32 },
  { date: "Неделя 3", positive: 42, neutral: 28, negative: 30 },
  { date: "Неделя 4", positive: 45, neutral: 30, negative: 25 },
];

const defaultTopicsData = [
  { name: "Скорость доставки", count: 234, sentiment: "mixed" as const },
  { name: "Качество товара", count: 198, sentiment: "positive" as const },
  { name: "Обслуживание", count: 176, sentiment: "positive" as const },
  { name: "Цена", count: 154, sentiment: "negative" as const },
  { name: "Упаковка", count: 142, sentiment: "mixed" as const },
];

const defaultCommonComplaints = [
  "Медленная доставка",
  "Повреждённый товар при доставке",
  "Неясные описания товара",
  "Сложно связаться с поддержкой",
  "Товар отсутствует в наличии",
];

const defaultPositiveAspects = [
  "Отличное качество товара",
  "Удобный интерфейс",
  "Быстрая обработка",
  "Хорошее отношение к клиентам",
  "Прозрачные условия доставки",
];

type ThemeCount = {
  topic: string;
  count: number;
};

type DayCount = {
  date: string; // "2025-11-13"
  count: number;
};

type DashboardSummaryResponse = {
  total_reviews: number;
  sentiment_distribution: Record<string, number>; // "положительная" | "нейтральная" | "отрицательная"
  avg_sentiment_score: number;
  total_themes: number;
  non_positive_themes: number;
  top_negative_themes: ThemeCount[];
  top_positive_themes: ThemeCount[];
  daily_counts: Record<string, DayCount[]>; // ключи: те же 3 тональности
};

function buildSentimentData(
  dist: Record<string, number>,
  totalReviews: number,
) {
  const total =
    totalReviews || Object.values(dist || {}).reduce((acc, v) => acc + (v || 0), 0);

  const mapping = [
    { key: "положительная", name: "Позитивные", color: "#00b4d8" },
    { key: "нейтральная", name: "Нейтральные", color: "#90e0ef" },
    { key: "отрицательная", name: "Негативные", color: "#0096c7" },
  ];

  return mapping.map(({ key, name, color }) => {
    const count = dist?.[key] ?? 0;
    const value = total ? Math.round((count / total) * 100) : 0;
    return { name, value, color };
  });
}

type SentimentTimelinePoint = {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
};

function buildSentimentTimeline(
  daily: DashboardSummaryResponse["daily_counts"],
): SentimentTimelinePoint[] {
  if (!daily) return [];

  const datesSet = new Set<string>();

  (daily["положительная"] ?? []).forEach((d) => datesSet.add(d.date));
  (daily["нейтральная"] ?? []).forEach((d) => datesSet.add(d.date));
  (daily["отрицательная"] ?? []).forEach((d) => datesSet.add(d.date));

  const dates = Array.from(datesSet).sort(); // YYYY-MM-DD нормально сортируются как строки

  const getCount = (sentimentKey: string, date: string) =>
    (daily[sentimentKey] ?? []).find((item) => item.date === date)?.count ?? 0;

  return dates.map((date) => ({
    date,
    positive: getCount("положительная", date),
    neutral: getCount("нейтральная", date),
    negative: getCount("отрицательная", date),
  }));
}

export default function ReviewsAnalysis() {
  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = "http://localhost:8000"; // или через env, если хочешь
        // Проверяем глобальный флаг анализа
        try {
          const ia = await fetch(`${baseUrl}/api/dashboard/is-analyzing`, { method: "GET", cache: "no-store" });
          if (ia.ok) {
            const j = await ia.json();
            if (j?.is_analyzing) {
              setIsAnalyzing(true);
              setDashboard(null);
              setLoading(false);
              return; // не выполняем запрос summary
            }
            setIsAnalyzing(false);
          }
        } catch (e) {
          // не критично — продолжаем
          setIsAnalyzing(false);
        }

        const today = new Date();

        const endDate = today.toISOString().slice(0, 10); // YYYY-MM-DD

        const start = new Date();
        start.setDate(today.getDate() - 30); // последние 30 дней
        const startDate = start.toISOString().slice(0, 10);

        const productId = 1; // пока жёстко, можно потом сделать выбор товара

        const url = `${baseUrl}/api/dashboard/summary?start_date=${startDate}&end_date=${endDate}&product_id=${productId}`;

        const resp = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!resp.ok) {
          const text = await resp.text();
          console.error("Dashboard error:", resp.status, text);
          throw new Error(`Ошибка сервера: ${resp.status}`);
        }

        const contentType = resp.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await resp.text();
          console.error("Ожидали JSON, получили:", text);
          throw new Error("Сервер вернул не JSON");
        }

        const data = (await resp.json()) as DashboardSummaryResponse;
        console.log("Dashboard summary:", data);
        setDashboard(data);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить данные анализа");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const sentimentData =
    isAnalyzing
      ? []
      : dashboard && dashboard.sentiment_distribution
      ? buildSentimentData(dashboard.sentiment_distribution, dashboard.total_reviews)
      : defaultSentimentData;

  const sentimentTimeline =
    isAnalyzing
      ? []
      : dashboard && dashboard.daily_counts
      ? buildSentimentTimeline(dashboard.daily_counts)
      : defaultSentimentTimeline;

  const topicsData =
    isAnalyzing
      ? []
      : dashboard &&
        (dashboard.top_positive_themes.length > 0 || dashboard.top_negative_themes.length > 0)
      ? [
          ...dashboard.top_positive_themes.map((t) => ({ name: t.topic, count: t.count, sentiment: "positive" as const })),
          ...dashboard.top_negative_themes.map((t) => ({ name: t.topic, count: t.count, sentiment: "negative" as const })),
        ].sort((a, b) => b.count - a.count)
      : defaultTopicsData;

  const commonComplaints =
    isAnalyzing ? ["-"] : dashboard && dashboard.top_negative_themes.length ? dashboard.top_negative_themes.map((t) => t.topic) : defaultCommonComplaints;

  const positiveAspects =
    isAnalyzing ? ["-"] : dashboard && dashboard.top_positive_themes.length ? dashboard.top_positive_themes.map((t) => t.topic) : defaultPositiveAspects;

  return (
    <Layout>
      <div className="space-y-8">
        {isAnalyzing === true && (
          <div className="rounded-md border border-orange-300 bg-orange-50 p-4 text-orange-900">
            <strong>Идёт анализ данных.</strong> Попробуйте позже.
          </div>
        )}
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary-900">
            Анализ отзывов
          </h1>
          <p className="text-lg text-primary-600">
            Глубокие инсайты о тональности, темах и тенденциях клиентов
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card-elevated space-y-2 p-6">
            <p className="text-sm font-medium text-primary-600">Всего отзывов</p>
            <p className="text-3xl font-bold text-primary-900">{isAnalyzing ? "-" : dashboard ? dashboard.total_reviews : "1 247"}</p>
          </div>
          <div className="card-elevated space-y-2 p-6">
            <p className="text-sm font-medium text-primary-600">Средняя тональность</p>
            <p className="text-3xl font-bold text-primary-900">{isAnalyzing ? "-" : dashboard ? dashboard.avg_sentiment_score.toFixed(2) : "4.20"}</p>
          </div>
          <div className="card-elevated space-y-2 p-6">
            <p className="text-sm font-medium text-primary-600">Ключевые темы</p>
            <p className="text-3xl font-bold text-primary-900">{isAnalyzing ? "-" : dashboard ? dashboard.total_themes : "12"}</p>
            <p className="text-xs text-primary-500">Категорий определено</p>
          </div>
          <div className="card-elevated space-y-2 p-6">
            <p className="text-sm font-medium text-primary-600">Критические проблемы</p>
            <p className="text-3xl font-bold text-orange-600">{isAnalyzing ? "-" : dashboard ? dashboard.non_positive_themes : "8"}</p>
            <p className="text-xs text-orange-600">Требуют внимания</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sentiment Distribution */}
          <div className="card-elevated p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary-900">
              Распределение тональности
            </h2>
            {isAnalyzing ? (
              <div className="flex h-72 items-center justify-center text-2xl">-</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Sentiment Trend */}
          <div className="card-elevated p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary-900">
              Тренд тональности
            </h2>
            {isAnalyzing ? (
              <div className="flex h-72 items-center justify-center text-2xl">-</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sentimentTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                  <XAxis dataKey="date" stroke="#0096c7" />
                  <YAxis stroke="#0096c7" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #90e0ef",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="positive" stroke="#00b4d8" strokeWidth={2} name="Позитивные" />
                  <Line type="monotone" dataKey="neutral" stroke="#90e0ef" strokeWidth={2} name="Нейтральные" />
                  <Line type="monotone" dataKey="negative" stroke="#0096c7" strokeWidth={2} name="Негативные" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Topics */}
          <div className="card-elevated p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary-900">
              Топ тем по упоминаниям
            </h2>
            {isAnalyzing ? (
              <div className="flex h-72 items-center justify-center text-2xl">-</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicsData}
                 margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" />
                  <YAxis stroke="#0096c7" />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #90e0ef" }} />
                  <Bar dataKey="count" fill="#0096c7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Topic Details */}
          <div className="card-elevated space-y-4 p-6">
            <h2 className="text-lg font-semibold text-primary-900">
              Детали тем
            </h2>
            <div className="space-y-3">
              {isAnalyzing
                ? ["-"].map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-primary-200 bg-white p-3">
                      <div className="flex-1">
                        <p className="font-medium text-primary-900">-</p>
                        <p className="text-xs text-primary-600">-</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700`}>-</div>
                    </div>
                  ))
                : topicsData.map((topic) => (
                    <div key={topic.name} className="flex items-center justify-between rounded-lg border border-primary-200 bg-white p-3">
                      <div className="flex-1">
                        <p className="font-medium text-primary-900">{topic.name}</p>
                        <p className="text-xs text-primary-600">{topic.count} упоминаний</p>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                        topic.sentiment === "positive"
                          ? "bg-blue-100 text-blue-700"
                          : topic.sentiment === "negative"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>{topic.sentiment === "positive" ? "позитивное" : topic.sentiment === "negative" ? "негативное" : "смешанное"}</div>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Issues and Positives */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Common Complaints */}
          <div className="card-elevated p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-primary-900">
                Основные жалобы
              </h2>
            </div>
            <div className="space-y-3">
              {commonComplaints.map((complaint, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50/50 p-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-orange-600" />
                  <p className="text-sm text-primary-900">{isAnalyzing ? "-" : complaint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Positive Aspects */}
          <div className="card-elevated p-6">
            <div className="mb-4 flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-primary-900">
                Что нравится клиентам
              </h2>
            </div>
            <div className="space-y-3">
              {positiveAspects.map((aspect, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50/50 p-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-600" />
                  <p className="text-sm text-primary-900">{isAnalyzing ? "-" : aspect}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
