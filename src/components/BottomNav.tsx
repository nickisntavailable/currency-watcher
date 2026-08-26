"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
    { href: "/", icon: "wallet", label: "Наборы" },
    { href: "/monthly", icon: "calendar", label: "Месяц" },
    { href: "/trends", icon: "trending-up", label: "Тренды" },
    { href: "/settings", icon: "settings", label: "Настройки" },
] as const;

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="sticky bottom-0 z-10 flex shrink-0 border-t border-black/10 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-black/95">
            {TABS.map((tab) => {
                const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
                            active
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-zinc-500 dark:text-zinc-400"
                        }`}
                    >
                        <i className={`ti ti-${tab.icon} text-xl`} aria-hidden />
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
