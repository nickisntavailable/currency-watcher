"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useActiveSet } from "@/contexts/ActiveSetContext";

type MonthData = { dateIso: string; rates: Record<string, number> };

function parseAmount(raw: string): number {
    const normalized = raw.replace(/\s/g, "").replace(",", ".");
    const value = parseFloat(normalized);
    return Number.isFinite(value) ? value : 0;
}

function formatAmount(value: number): string {
    if (!Number.isFinite(value)) return "—";
    return value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

export default function MonthlyScreen({ months }: { months: MonthData[] }) {
    const { activeSet } = useActiveSet();
    const [annualAmount, setAnnualAmount] = useState("1200");
    const [denomCode, setDenomCode] = useState<string | null>(null);
    const [initializedSetId, setInitializedSetId] = useState<string | null>(null);

    if (activeSet && activeSet.id !== initializedSetId) {
        setInitializedSetId(activeSet.id);
        setDenomCode(activeSet.baseCurrency ?? activeSet.currencyCodes[0]);
    }

    const rows = useMemo(() => {
        if (!activeSet || !denomCode) return [];
        const monthly = parseAmount(annualAmount) / 12;

        return months.map((month) => {
            const values: Record<string, number> = {};
            for (const code of activeSet.currencyCodes) {
                values[code] = (monthly * month.rates[code]) / month.rates[denomCode];
            }
            return { dateIso: month.dateIso, values };
        });
    }, [months, activeSet, denomCode, annualAmount]);

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
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Сумма в год</span>
                <input
                    inputMode="decimal"
                    value={annualAmount}
                    onChange={(e) => setAnnualAmount(e.target.value)}
                    className="ml-auto w-24 bg-transparent text-right text-lg font-semibold outline-none"
                />
                <select
                    value={denomCode ?? ""}
                    onChange={(e) => setDenomCode(e.target.value)}
                    className="rounded-lg bg-zinc-100 px-2 py-1 text-sm font-medium dark:bg-zinc-800"
                >
                    {activeSet.currencyCodes.map((code) => (
                        <option key={code} value={code}>
                            {code}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-black/10 text-left text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                            <th className="px-3 py-2 font-medium">Месяц</th>
                            {activeSet.currencyCodes.map((code) => (
                                <th key={code} className="px-3 py-2 text-right font-medium">
                                    {code}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.dateIso}
                                className="border-b border-black/5 last:border-0 dark:border-white/5"
                            >
                                <td className="whitespace-nowrap px-3 py-2 capitalize">
                                    {new Date(row.dateIso).toLocaleDateString("ru-RU", {
                                        month: "short",
                                        year: "2-digit",
                                    })}
                                </td>
                                {activeSet.currencyCodes.map((code) => (
                                    <td key={code} className="px-3 py-2 text-right tabular-nums">
                                        {formatAmount(row.values[code])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
