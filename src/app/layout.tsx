import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getFavoriteSets } from "@/lib/favorite-sets";
import { getAppSettings } from "@/lib/app-settings";
import { ActiveSetProvider } from "@/contexts/ActiveSetContext";
import BottomNav from "@/components/BottomNav";
import ThemeProvider from "@/components/ThemeProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Currency Watcher",
  description: "Конвертер валют по наборам",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Currency Watcher",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

// Наборы валют и настройки читаются из Postgres на каждый запрос и меняются
// произвольно (CRUD в /settings) — статическая генерация тут в принципе не подходит,
// а на build-время ещё и требовала бы живого подключения к БД, которого при сборке
// на хостинге может не быть. Форсируем динамический рендеринг для всего приложения.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [sets, settings] = await Promise.all([getFavoriteSets(), getAppSettings()]);

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.46.0/dist/tabler-icons.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/css/flag-icons.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme={settings.theme}>
          <ActiveSetProvider sets={sets} defaultSetId={settings.defaultSetId}>
            <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
            <BottomNav />
          </ActiveSetProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
