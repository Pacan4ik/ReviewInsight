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

const sentimentData = [
  { name: "Позитивные", value: 45, color: "#00b4d8" },
  { name: "Нейтральные", value: 30, color: "#90e0ef" },
  { name: "Негативные", value: 25, color: "#0096c7" },
];

const sentimentTimeline = [
  { date: "Неделя 1", positive: 35, neutral: 28, negative: 37 },
  { date: "Неделя 2", positive: 38, neutral: 30, negative: 32 },
  { date: "Неделя 3", positive: 42, neutral: 28, negative: 30 },
  { date: "Неделя 4", positive: 45, neutral: 30, negative: 25 },
];

const topicsData = [
  { name: "Скорость доставки", count: 234, sentiment: "mixed" },
  { name: "Качество товара", count: 198, sentiment: "positive" },
  { name: "Обслуживание", count: 176, sentiment: "positive" },
  { name: "Цена", count: 154, sentiment: "negative" },
  { name: "Упаковка", count: 142, sentiment: "mixed" },
];

const commonComplaints = [
  "Медленная доставка",
  "Повреждённый товар п��и доставке",
  "Неясные описания товара",
  "Сложно связаться с поддержкой",
  "Товар отсутствует в наличии",
];

const positiveAspects = [
  "Отличное качество товара",
  "Удобный интерфейс",
  "Быстрая обработка",
  "Хорошее соотношение цены и качества",
  "Профессиональное обслуживание",
];

export default function ReviewsAnalysis() {
  return (
    <Layout>
      <div className="space-y-8">
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
            <p className="text-3xl font-bold text-primary-900">1 247</p>
            <p className="text-xs text-primary-500">+15% от прошлого месяца</p>
          </div>
          <div className="card-elevated space-y-2 p-6">
            <p className="text-sm font-medium text-primary-600">Средняя тональность</p>
            <p className="text-3xl font-bold text-primary-900">4.2/5.0</p>
            <p className="text-xs text-green-600">↑ Улучшается</p>
          </div>
          <div className="card-elevated space-y-2 p-6">
            <p className="text-sm font-medium text-primary-600">
              Ключевые темы
            </p>
            <p className="text-3xl font-bold text-primary-900">12</p>
            <p className="text-xs text-primary-500">Категорий определено</p>
          </div>
          <div className="card-elevated space-y-2 p-6">
            <p className="text-sm font-medium text-primary-600">
              Критические проблемы
            </p>
            <p className="text-3xl font-bold text-orange-600">8</p>
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
          </div>

          {/* Sentiment Trend */}
          <div className="card-elevated p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary-900">
              Тренд тональности
            </h2>
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
                <Line
                  type="monotone"
                  dataKey="positive"
                  stroke="#00b4d8"
                  strokeWidth={2}
                  name="Позитивные"
                />
                <Line
                  type="monotone"
                  dataKey="neutral"
                  stroke="#90e0ef"
                  strokeWidth={2}
                  name="Нейтральные"
                />
                <Line
                  type="monotone"
                  dataKey="negative"
                  stroke="#0096c7"
                  strokeWidth={2}
                  name="Негативные"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Topics */}
          <div className="card-elevated p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary-900">
              Топ тем по упоминаниям
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" />
                <YAxis stroke="#0096c7" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #90e0ef",
                  }}
                />
                <Bar dataKey="count" fill="#0096c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Details */}
          <div className="card-elevated space-y-4 p-6">
            <h2 className="text-lg font-semibold text-primary-900">
              Детали тем
            </h2>
            <div className="space-y-3">
              {topicsData.map((topic) => (
                <div
                  key={topic.name}
                  className="flex items-center justify-between rounded-lg border border-primary-200 bg-white p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-primary-900">
                      {topic.name}
                    </p>
                    <p className="text-xs text-primary-600">
                      {topic.count} упоминаний
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      topic.sentiment === "positive"
                        ? "bg-blue-100 text-blue-700"
                        : topic.sentiment === "negative"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {topic.sentiment === "positive"
                      ? "позитивное"
                      : topic.sentiment === "negative"
                        ? "негативное"
                        : "смешанное"}
                  </div>
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
                Основные ��алобы
              </h2>
            </div>
            <div className="space-y-3">
              {commonComplaints.map((complaint, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50/50 p-3"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-orange-600" />
                  <p className="text-sm text-primary-900">{complaint}</p>
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
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50/50 p-3"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-600" />
                  <p className="text-sm text-primary-900">{aspect}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
