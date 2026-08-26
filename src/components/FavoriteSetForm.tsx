"use client";

import { useState, type FormEvent } from "react";
import type { FavoriteSet } from "@prisma/client";
import { AVAILABLE_ICONS } from "@/lib/currencies";
import { SUPPORTED_CURRENCIES } from "@/lib/rates";
import type { FavoriteSetInput } from "@/lib/favorite-sets";

export default function FavoriteSetForm({
    initial,
    error,
    pending,
    onCancel,
    onSave,
}: {
    initial: FavoriteSet | null;
    error: string | null;
    pending: boolean;
    onCancel: () => void;
    onSave: (input: FavoriteSetInput) => void;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [icon, setIcon] = useState(initial?.icon ?? AVAILABLE_ICONS[0]);
    const [currencyCodes, setCurrencyCodes] = useState<string[]>(initial?.currencyCodes ?? []);
    const [baseCurrency, setBaseCurrency] = useState(initial?.baseCurrency ?? "");

    function toggleCurrency(code: string) {
        setCurrencyCodes((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
        );
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onSave({ name, icon, currencyCodes, baseCurrency: baseCurrency || null });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-black/10 p-4 dark:border-white/10"
        >
            <div className="flex flex-col gap-1.5">
                <label htmlFor="set-name" className="text-sm text-zinc-500 dark:text-zinc-400">
                    Название
                </label>
                <input
                    id="set-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например, Путешествия"
                    className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-transparent"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Иконка</span>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ICONS.map((iconName) => (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => setIcon(iconName)}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                                icon === iconName
                                    ? "bg-blue-600 text-white"
                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                        >
                            <i className={`ti ti-${iconName}`} aria-hidden />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Валюты</span>
                <div className="flex flex-wrap gap-2">
                    {SUPPORTED_CURRENCIES.map((code) => {
                        const selected = currencyCodes.includes(code);
                        return (
                            <button
                                key={code}
                                type="button"
                                onClick={() => toggleCurrency(code)}
                                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                    selected
                                        ? "bg-blue-600 text-white"
                                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                }`}
                            >
                                {code}
                            </button>
                        );
                    })}
                </div>
            </div>

            {currencyCodes.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Базовая валюта (необязательно)
                    </span>
                    <select
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value)}
                        className="rounded-lg border border-black/10 px-3 py-2 dark:border-white/10 dark:bg-transparent"
                    >
                        <option value="">Не задана</option>
                        {currencyCodes.map((code) => (
                            <option key={code} value={code}>
                                {code}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 rounded-xl bg-blue-600 py-2.5 font-medium text-white disabled:opacity-50"
                >
                    {pending ? "Сохранение…" : "Сохранить"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl bg-zinc-100 px-4 py-2.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}
