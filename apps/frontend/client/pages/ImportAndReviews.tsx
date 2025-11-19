import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Database, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";


export default function ImportAndReviews() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const baseUrl = "http://localhost:8000";

  const [localFile, setLocalFile] = useState<{ file: File; name: string } | null>(null);



  // Загружаем "последние загрузки" с бэкенда
  const loadLastImports = async () => {
    try {
      const resp = await fetch(`${baseUrl}/api/reviews/last_imports`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!resp.ok) {
        console.error("last_imports error", resp.status);
        return;
      }

      const data = await resp.json();

      // Превращаем батчи в человекочитаемые строки
      const files: string[] = (data.batches ?? []).map((b: any) => {
        const id = b.id ?? "—";
        const src = b.source_type ?? b.source ?? "csv";
        const created = b.created_at ?? b.created ?? "";
        return `Пакет #${id} (${src}) ${created}`;
      });

      setUploadedFiles(files);
    } catch (e) {
      console.error("Не удалось получить последние загрузки", e);
    }
  };

  useEffect(() => {
    loadLastImports();
  }, []);

  // Обработка выбора файла CSV/Excel
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setLocalFile({ file, name: file.name });
  event.target.value = "";
};



  const handleRefreshLastImports = () => {
    loadLastImports();
  };

  const handleStartProcessing = async () => {

  if (!localFile) {
  toast({ variant: "destructive", title: "Файл не выбран" });
  return;
}

  try {

    const formData = new FormData();
    formData.append("file", localFile.file);
    formData.append("source", "csv");
    formData.append("delimiter", ",");
    formData.append("encoding", "utf-8");
    formData.append("metadata", JSON.stringify({ original_filename: localFile.name }));

    await fetch(`${baseUrl}/api/reviews/import`, {
      method: "POST",
      body: formData,
    });

    toast({
      title: "Обработка запущена",
      description: "Выбранные файлы отправлены на анализ",
    });
  } catch (e) {
    console.error(e);
    toast({
      variant: "destructive",
      title: "Ошибка",
      description: "Произошла ошибка при запуске обработки",
    });
  }
};



  const importSources = [
    {
      title: "Импорт CSV/Excel",
      description: "Загружайте данные отзывов клиентов из таблиц",
      icon: FileText,
      placeholder: "Нажмите для загрузки файлов CSV или Excel",
    },
    {
      title: "Интеграция API",
      description: "Подключитесь к системам CRM/ERP (Salesforce, HubSpot и т.д.)",
      icon: Database,
      placeholder: "Введите учётные данные API",
    },
    {
      title: "Веб-форма обратной связи",
      description: "Собирайте отзывы через встроенные веб-формы",
      icon: Upload,
      placeholder: "Активируйте сбор обратной связи",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary-900">
            Импорт и управление отзывами
          </h1>
          <p className="text-lg text-primary-600">
            Собирайте и подготавливайте данные отзывов клиентов из нескольких источников
          </p>
        </div>

        {/* Import Sources Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {importSources.map((source) => {
            const Icon = source.icon;
            const isCsvSource = source.title === "Импорт CSV/Excel";

            return (
                <div
                    key={source.title}
                    className="card-elevated group flex flex-col gap-4 p-6 transition-all hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                        className="rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 p-3 group-hover:shadow-lg">
                      <Icon className="h-6 w-6 text-white"/>
                    </div>
                    <h2 className="text-xl font-semibold text-primary-900">
                      {source.title}
                    </h2>
                  </div>

                  <p className="text-sm text-primary-700">{source.description}</p>

                  <div className="flex-1 rounded-lg border-2 border-dashed border-primary-300 p-4 text-center">
                    {isCsvSource ? (
                        <label
                            className="flex h-full cursor-pointer flex-col items-center justify-center text-sm text-primary-600"
                        >
                          <input
                              ref={fileInputRef}
                              type="file"
                              accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              className="hidden"
                              onChange={handleFileChange}
                          />

                          {isUploading ? (
                              "Загрузка файла…"
                          ) : localFile ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-sm text-primary-800">{localFile.name}</span>
                              </div>
                          ) : (
                              <span>{source.placeholder}</span>
                          )}
                        </label>
                    ) : (
                        <p className="text-sm text-primary-600">{source.placeholder}</p>
                    )}
                  </div>


                  {isCsvSource ? (
                      <Button
                          className="w-full bg-primary-600 hover:bg-primary-700"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                      >
                        <Upload className="h-4 w-4"/>
                        {isUploading ? "Загружаем…" : "Загрузить файл"}
                      </Button>
                  ) : (
                      <Button className="w-full bg-primary-600 hover:bg-primary-700">
                        <Upload className="h-4 w-4"/>
                        Настроить
                      </Button>
                  )}
                </div>
            );
          })}
        </div>

        {/* Upload Status */}
        <div className="card-elevated space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary-900">
              Последние загрузки
            </h2>
            <Button
                variant="outline"
                size="sm"
                className="border-primary-300 text-primary-600 hover:bg-primary-50"
                onClick={handleRefreshLastImports}
            >
              <RefreshCw className="h-4 w-4"/>
              Обновить
            </Button>

          </div>

          {uploadedFiles.length === 0 ? (
              <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-8 text-center">
                <p className="text-primary-600">
                  Файлы не загружены. Начните с загрузки данных отзывов выше.
                </p>
              </div>
          ) : (
              <div className="space-y-2">
                {uploadedFiles.map((file, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-primary-200 bg-white p-4"
                    >
                      <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary-600" />
                    <span className="font-medium text-primary-900">{file}</span>
                  </div>
                  <span className="text-xs text-primary-600">Готово</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Preprocessing Options */}
        <div className="card-elevated space-y-4 p-6">
          <h2 className="text-xl font-semibold text-primary-900">
            Предварительная обработка данных
          </h2>
          <p className="text-primary-700">
            Настройте способ очистки и подготовки данных отзывов для анализа
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-primary-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary-600"
                  defaultChecked
                />
                <label className="font-medium text-primary-900">
                  Удалить дубликаты
                </label>
              </div>
              <p className="mt-2 ml-7 text-sm text-primary-600">
                Исключите дублирующиеся отзывы из набора данных
              </p>
            </div>

            <div className="rounded-lg border border-primary-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary-600"
                  defaultChecked
                />
                <label className="font-medium text-primary-900">
                  Удалить спам
                </label>
              </div>
              <p className="mt-2 ml-7 text-sm text-primary-600">
                Отфильтруйте спам и низкокачественные отзывы
              </p>
            </div>

            <div className="rounded-lg border border-primary-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary-600"
                  defaultChecked
                />
                <label className="font-medium text-primary-900">
                  Нормализовать текст
                </label>
              </div>
              <p className="mt-2 ml-7 text-sm text-primary-600">
                Стандартизируйте регистр и форматирование
              </p>
            </div>

            <div className="rounded-lg border border-primary-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary-600"
                  defaultChecked
                />
                <label className="font-medium text-primary-900">
                  Автоопределение языка
                </label>
              </div>
              <p className="mt-2 ml-7 text-sm text-primary-600">
                Автоматически определяйте язык отзывов
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <Button
                onClick={handleStartProcessing}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Начать обработку
              </Button>

              <Button
                  variant="outline"
                  className="border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                Сохранить настройки
              </Button>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}
