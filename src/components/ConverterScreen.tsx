"use client";

import { useState } from "react";
import Link from "next/link";
import { useActiveSet } from "@/contexts/ActiveSetContext";
import { CURRENCY_INFO } from "@/lib/currencies";

function formatAmount(value: number): string {
    if (!Number.isFinite(value)) return "";
    return value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

function parseAmount(raw: string): number {
    const normalized = raw.replace(/\s/g, "").replace(",", ".");
    const value = parseFloat(normalized);
    return Number.isFinite(value) ? value : 0;
}

export default function ConverterScreen({ rates }: { rates: Record<string, number> }) {
    const { activeSet } = useActiveSet();
    const [amounts, setAmounts] = useState<Record<string, string>>({});
    const [initializedSetId, setInitializedSetId] = useState<string | null>(null);

    // Пересчитываем стартовые суммы при смене активного набора (или при заходе на
    // вкладку со свежими rates) прямо во время рендера — это производное состояние,
    // не синхронизация с внешней системой, поэтому useEffect тут не нужен.
    if (activeSet && activeSet.id !== initializedSetId) {
        setInitializedSetId(activeSet.id);
        const base = activeSet.baseCurrency ?? activeSet.currencyCodes[0];
        const initial: Record<string, string> = {};
        for (const code of activeSet.currencyCodes) {
            initial[code] = code === base ? "1" : formatAmount(rates[code] / rates[base]);
        }
        setAmounts(initial);
    }

    if (!activeSet) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-zinc-500 dark:text-zinc-400">
                <i className="ti ti-wallet-off text-4xl" aria-hidden />
                <p>Создайте набор валют в настройках, чтобы начать конвертацию</p>
                <Link href="/settings" className="font-medium text-blue-600 dark:text-blue-400">
                    Перейти в настройки
                </Link>
            </div>
        );
    }

    function handleChange(code: string, raw: string) {
        if (!activeSet) return;
        const amountValue = parseAmount(raw);
        const next: Record<string, string> = { ...amounts, [code]: raw };
        for (const other of activeSet.currencyCodes) {
            if (other === code) continue;
            next[other] = raw === "" ? "" : formatAmount((amountValue * rates[other]) / rates[code]);
        }
        setAmounts(next);
    }

    return (
        <div className="flex flex-col gap-3 p-4">
            {activeSet.currencyCodes.map((code) => {
                const info = CURRENCY_INFO[code];
                return (
                    <label
                        key={code}
                        className="flex items-center gap-3 rounded-2xl border border-black/10 px-4 py-3 dark:border-white/10"
                    >
                        <span className={`fi fi-${info?.flag ?? ""} rounded text-2xl shrink-0`} aria-hidden />
                        <div className="flex min-w-0 flex-col">
                            <span className="font-semibold">{code}</span>
                            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                {info?.name ?? code}
                            </span>
                        </div>
                        <input
                            inputMode="decimal"
                            value={amounts[code] ?? ""}
                            onChange={(e) => handleChange(code, e.target.value)}
                            placeholder="0"
                            className="ml-auto w-28 bg-transparent text-right text-xl font-semibold outline-none"
                        />
                    </label>
                );
            })}
        </div>
    );
}
