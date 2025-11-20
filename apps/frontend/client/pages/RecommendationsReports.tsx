import {Layout} from "@/components/Layout";
import {Button} from "@/components/ui/button";
import {Download, Lightbulb, BarChart3, FileText} from "lucide-react";
import {useEffect, useState} from "react";


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
    feedback_analysis: FeedbackAnalysis[]; // ✅ массив
    overall_proposals: [];
};

export default function RecommendationsReports() {
    const [feedbackReport, setFeedbackReport] = useState<FeedbackReportResponse | null>(null);
    const [feedbackLoading, setFeedbackLoading] = useState(true);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean | null>(null);

    // Новое состояние: brief summary, инициализируем прежними статичными данными как fallback
    const [briefSummary, setBriefSummary] = useState(() => ({
        totalReviews: executiveSummary.totalReviews,
        avgRating: executiveSummary.avgRating,
        mainChallenges: executiveSummary.mainChallenges,
        strengths: executiveSummary.strengths,
        timeframe: executiveSummary.timeframe,
        // sentiment counts
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
    }));

    useEffect(() => {
        const fetchBrief = async (baseUrl: string) => {
            try {
                const resp = await fetch(`${baseUrl}/api/recommendations/brief`, {
                    method: "GET",
                    headers: {"Accept": "application/json"},
                    cache: "no-store",
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();

                // Ожидаем поля: total_reviews, avg_sentiment_score, top_negative_themes, top_positive_themes
                const totalReviews = typeof data.total_reviews === "number" ? data.total_reviews : briefSummary.totalReviews;
                const avgRating = typeof data.avg_sentiment_score === "number" ? data.avg_sentiment_score : briefSummary.avgRating;

                const mainChallenges = Array.isArray(data.top_negative_themes)
                    ? data.top_negative_themes.map((t: any) => `${t.topic} (${t.count} упоминания)`)
                    : briefSummary.mainChallenges;

                const strengths = Array.isArray(data.top_positive_themes)
                    ? data.top_positive_themes.map((t: any) => `${t.topic} (${t.count} упоминания)`)
                    : briefSummary.strengths;

                const positiveCount = typeof data.positive_themes === "number" ? data.positive_themes : 0;
                const negativeCount = typeof data.negative_themes === "number" ? data.negative_themes : 0;
                const neutralCount = typeof data.neutral_themes === "number" ? data.neutral_themes : 0;

                setBriefSummary({
                    totalReviews,
                    avgRating,
                    mainChallenges,
                    strengths,
                    timeframe: briefSummary.timeframe,
                    positiveCount,
                    negativeCount,
                    neutralCount
                });
            } catch (e) {
                // Если не удалось получить brief — оставляем прежние данные
                console.error("Failed to load brief summary:", e);
            }
        };

        const fetchFeedback = async () => {
            try {
                setFeedbackLoading(true);
                setFeedbackError(null);

                // Можно через env-переменную, чтобы не хардкодить бэкенд-URL
                const baseUrl = "http://localhost:8000";

                // Сначала проверяем, не идёт ли глобальный анализ
                try {
                    const ia = await fetch(`${baseUrl}/api/dashboard/is-analyzing`, {method: "GET", cache: "no-store"});
                    if (ia.ok) {
                        const j = await ia.json();
                        if (j?.is_analyzing) {
                            setIsAnalyzing(true);
                            setFeedbackError("Идёт анализ данных. Попробуйте позже.");
                            setFeedbackLoading(false);
                            return; // не делаем дальнейших запросов
                        }
                        setIsAnalyzing(false);
                    }
                } catch (e) {
                    // если проверка упала — считаем, что анализ не идёт и продолжаем
                    setIsAnalyzing(false);
                }

                // Загруем сначала brief (чтобы сразу отрисовать executive summary), затем рекомендации
                await fetchBrief(baseUrl);

                const resp = await fetch(`${baseUrl}/api/recommendations/feedback-report`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                    },
                    cache: "no-store",      // <--- ВАЖНО: отключаем кеш
                });

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

                {/* Если идёт глобальный анализ — показываем уведомление и блокируем действия */}
                {isAnalyzing === true && (
                    <div className="rounded-md border border-orange-300 bg-orange-50 p-4 text-orange-900">
                        <strong>Идёт анализ данных.</strong> Попробуйте позже.
                    </div>
                )}

                {/* Export Options */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button disabled={isAnalyzing === true}
                            className={`flex-1 bg-primary-600 hover:bg-primary-700 sm:flex-none ${isAnalyzing === true ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <Download className="h-4 w-4"/>
                        Экспортировать в PDF
                    </Button>
                    <Button
                        disabled={isAnalyzing === true}
                        variant="outline"
                        className={`flex-1 border border-primary-300 text-primary-600 hover:bg-primary-50 sm:flex-none ${isAnalyzing === true ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Download className="h-4 w-4"/>
                        Экспортировать в Excel
                    </Button>
                    <Button
                        disabled={isAnalyzing === true}
                        variant="outline"
                        className={`flex-1 border border-primary-300 text-primary-600 hover:bg-primary-50 sm:flex-none ${isAnalyzing === true ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Download className="h-4 w-4"/>
                        Скачать отчёт
                    </Button>
                </div>

                {/* Executive Summary */}
                <div className="card-elevated space-y-6 p-6">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-primary-900">
                        <BarChart3 className="h-6 w-6"/>
                        Краткое резюме
                    </h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4">
                            <p className="text-sm font-medium text-primary-600">
                                Период анализа
                            </p>
                            <p className="mt-2 text-lg font-bold text-primary-900">
                                {isAnalyzing && "—"}
                                {!isAnalyzing && briefSummary.timeframe}
                            </p>
                        </div>
                        <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4">
                            <p className="text-sm font-medium text-primary-600">
                                Проанализировано отзывов
                            </p>
                            <p className="mt-2 text-lg font-bold text-primary-900">
                                {isAnalyzing && "—"}
                                {!isAnalyzing && briefSummary.totalReviews}
                            </p>
                        </div>
                        <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4">
                            <p className="text-sm font-medium text-primary-600">
                                Средний рейтинг
                            </p>
                            <p className="mt-2 text-lg font-bold text-primary-900">
                                {isAnalyzing && "—"}
                                {!isAnalyzing && Number(briefSummary.avgRating ?? 0).toFixed(2)}/5.0
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <h3 className="font-semibold text-primary-900">Основные проблемы</h3>
                            <div className="space-y-2">
                                {!isAnalyzing && briefSummary.mainChallenges.map((challenge, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 text-primary-700"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-orange-600"/>
                                        {challenge}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-semibold text-primary-900">Сильные стороны</h3>
                            <div className="space-y-2">
                                {!isAnalyzing && briefSummary.strengths.map((strength, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 text-primary-700"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-green-600"/>
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
                        <Lightbulb className="h-6 w-6"/>
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
                            {feedbackReport.feedback_analysis.map((analysis, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-lg border border-primary-200 bg-white p-5"
                                >
                                    <div className="mb-2 flex items-center gap-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold uppercase ${
                                                (analysis.prio || "").toLowerCase().includes("высок")
                                                    ? "bg-red-100 text-red-800"
                                                    : (analysis.prio || "").toLowerCase().includes("средн")
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : (analysis.prio || "").toLowerCase().includes("низк")
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-amber-100 text-amber-800"
                                            }`}
                                        >
                                          Приоритет: {analysis.prio}
                                        </span>
                                    </div>

                                    <h3 className="mb-2 text-lg font-semibold text-primary-900">
                                        Проблема: {analysis.problem}
                                    </h3>

                                    <p className="text-primary-700">
                                        {analysis.proposal_text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* Key Metrics Dashboard */}
                <div className="card-elevated space-y-6 p-6">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-primary-900">
                        <FileText className="h-6 w-6"/>
                        Панель ключевых метрик
                    </h2>

                    <div className="grid gap-6 md:grid-cols-1">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-primary-900">Здоровье тональности</h3>
                            <div className="space-y-3">
                                {(() => {
                                    const p = briefSummary.positiveCount ?? 0;
                                    const n = briefSummary.neutralCount ?? 0;
                                    const ng = briefSummary.negativeCount ?? 0;
                                    const total = p + n + ng;
                                    // fallback to previous static percentages when no data
                                    const posPct = total > 0 ? Math.round((p / total) * 100) : 45;
                                    const neuPct = total > 0 ? Math.round((n / total) * 100) : 30;
                                    const negPct = total > 0 ? 100 - posPct - neuPct : 25; // ensure sums to 100

                                    return (
                                        <>
                                            <div>
                                                <div className="mb-1 flex justify-between text-sm">
                                                    <span className="text-primary-600">Позитивные</span>
                                                    <span
                                                        className="font-medium text-primary-900">{!isAnalyzing && posPct}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-primary-100">
                                                    <div
                                                        className="h-full rounded-full bg-green-600"
                                                        style={{width: `${!isAnalyzing && posPct}%`}}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-1 flex justify-between text-sm">
                                                    <span className="text-primary-600">Нейтральные</span>
                                                    <span
                                                        className="font-medium text-primary-900">{!isAnalyzing && neuPct}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-primary-100">
                                                    <div
                                                        className="h-full rounded-full bg-blue-400"
                                                        style={{width: `${!isAnalyzing && neuPct}%`}}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="mb-1 flex justify-between text-sm">
                                                    <span className="text-primary-600">Негативные</span>
                                                    <span
                                                        className="font-medium text-primary-900">{!isAnalyzing && negPct}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-primary-100">
                                                    <div
                                                        className="h-full rounded-full bg-orange-600"
                                                        style={{width: `${!isAnalyzing && negPct}%`}}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
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
                            {Array.isArray(feedbackReport.overall_proposals) && feedbackReport.overall_proposals.length > 0 ? (
                                feedbackReport.overall_proposals.map((step: string, index: number) => (
                                    <li key={index} className="flex gap-3">
                                <span
                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                                  {index + 1}
                                </span>
                                        <span className="text-primary-900">{step}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-primary-600">Нет предложений</li>
                            )}
                        </ol>
                    )}
                </div>

            </div>
        </Layout>
    );
}
