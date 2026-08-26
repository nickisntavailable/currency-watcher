"use client";

import Link from "next/link";
import { useActiveSet } from "@/contexts/ActiveSetContext";

export default function SetChips() {
    const { sets, activeSetId, setActiveSetId } = useActiveSet();

    if (sets.length === 0) {
        return (
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                <span>Наборов пока нет</span>
                <Link href="/settings" className="font-medium text-blue-600 dark:text-blue-400">
                    Создать
                </Link>
            </div>
        );
    }

    return (
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {sets.map((set) => {
                const active = set.id === activeSetId;
                return (
                    <button
                        key={set.id}
                        type="button"
                        onClick={() => setActiveSetId(set.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                            active
                                ? "bg-blue-600 text-white"
                                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                    >
                        <i className={`ti ti-${set.icon}`} aria-hidden />
                        {set.name}
                    </button>
                );
            })}
        </div>
    );
}
