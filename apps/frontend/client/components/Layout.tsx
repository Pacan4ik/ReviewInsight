import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, FileText, Upload } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Панель управления",
      href: "/",
      icon: BarChart3,
    },
    {
      label: "Импорт отзывов",
      href: "/import",
      icon: Upload,
    },
    {
      label: "Анализ",
      href: "/analysis",
      icon: BarChart3,
    },
    {
      label: "Отчёты",
      href: "/reports",
      icon: FileText,
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <header className="glass-effect border-b border-primary-100/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 shadow-lg">
              <span className="text-lg font-bold text-white">RI</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary-900">Review Insight</span>
              <span className="text-xs font-medium text-primary-600">Аналитика на основе ИИ</span>
            </div>
          </Link>

          <nav className="hidden gap-1 md:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary-600 text-white shadow-md"
                      : "text-primary-900 hover:bg-white/50 hover:shadow-md"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary-100/50 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-primary-600 sm:px-8">
          <p>Review Insight © 2024 • Аналитика отзывов с помощью ИИ</p>
        </div>
      </footer>
    </div>
  );
}
