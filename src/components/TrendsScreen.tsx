"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useActiveSet } from "@/contexts/ActiveSetContext";
import { CURRENCY_INFO } from "@/lib/currencies";
import { SUPPORTED_CURRENCIES } from "@/lib/rates";

type RatesMap = Record<string, number>;

function pctChange(current: number, past: number): number {
    if (!Number.isFinite(past) || past === 0) return NaN;
    return ((current - past) / past) * 100;
}

function formatPct(value: number): string {
    if (!Number.isFinite(value)) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
}

function formatRate(value: number): string {
    if (!Number.isFinite(value)) return "—";
    return value.toLocaleString("ru-RU", { maximumFractionDigits: 4 });
}

export default function TrendsScreen({
    latest,
    past,
    mainCurrency,
}: {
    latest: RatesMap;
    past: { d7: RatesMap; d30: RatesMap; y1: RatesMap };
    mainCurrency: string;
}) {
    const { activeSet } = useActiveSet();
    const [baseCode, setBaseCode] = useState(mainCurrency);
    const [initializedSetId, setInitializedSetId] = useState<string | null>(null);

    if (activeSet && activeSet.id !== initializedSetId) {
        setInitializedSetId(activeSet.id);
        setBaseCode(activeSet.baseCurrency ?? mainCurrency);
    }

    const rows = useMemo(() => {
        if (!activeSet) return [];
        return activeSet.currencyCodes
            .filter((code) => code !== baseCode)
            .map((code) => {
                const current = latest[code] / latest[baseCode];
                return {
                    code,
                    current,
                    pct7: pctChange(current, past.d7[code] / past.d7[baseCode]),
                    pct30: pctChange(current, past.d30[code] / past.d30[baseCode]),
                    pct365: pctChange(current, past.y1[code] / past.y1[baseCode]),
                };
            });
    }, [activeSet, baseCode, latest, past]);

    if (!activeSet) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-zinc-500 dark:text-zinc-400">
                <i className="ti ti-wallet-off text-4xl" aria-hidden />
                <p>Создайте набор валют в настройках</p>
                <Link href="/settings" className="font-medium text-blue-600 dark:text-blue-400">
                    Перейти в настройки
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-black/10 px-4 py-3 dark:border-white/10">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">База</span>
                <select
                    value={baseCode}
                    onChange={(e) => setBaseCode(e.target.value)}
                    className="ml-auto rounded-lg bg-zinc-100 px-2 py-1 text-sm font-medium dark:bg-zinc-800"
                >
                    {SUPPORTED_CURRENCIES.map((code) => (
                        <option key={code} value={code}>
                            {code}
                        </option>
                    ))}
                </select>
            </div>

            {rows.length === 0 ? (
                <p className="px-1 text-sm text-zinc-500 dark:text-zinc-400">
                    В наборе нет валют, отличных от базовой
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {rows.map((row) => {
                        const info = CURRENCY_INFO[row.code];
                        return (
                            <div
                                key={row.code}
                                className="rounded-2xl border border-black/10 p-4 dark:border-white/10"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`fi fi-${info?.flag ?? ""} rounded text-2xl shrink-0`}
                                        aria-hidden
                                    />
                                    <div className="flex min-w-0 flex-col">
                                        <span className="font-semibold">
                                            1 {baseCode} = {formatRate(row.current)} {row.code}
                                        </span>
                                        <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                            {info?.name ?? row.code}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                                    {[
                                        { label: "7д", value: row.pct7 },
                                        { label: "30д", value: row.pct30 },
                                        { label: "1г", value: row.pct365 },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="rounded-xl bg-zinc-50 py-2 dark:bg-zinc-900">
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
                                            <div
                                                className={
                                                    value > 0
                                                        ? "font-semibold text-green-600 dark:text-green-400"
                                                        : value < 0
                                                          ? "font-semibold text-red-600 dark:text-red-400"
                                                          : "font-semibold text-zinc-500"
                                                }
                                            >
                                                {formatPct(value)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
