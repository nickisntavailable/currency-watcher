"use client";

import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import type { AppSettings, FavoriteSet } from "@prisma/client";
import {
    createFavoriteSet,
    updateFavoriteSet,
    deleteFavoriteSet,
    reorderFavoriteSets,
    type FavoriteSetInput,
} from "@/lib/favorite-sets";
import { updateAppSettings } from "@/lib/app-settings";
import { SUPPORTED_CURRENCIES } from "@/lib/rates";
import FavoriteSetForm from "@/components/FavoriteSetForm";

type EditorState = { mode: "create" } | { mode: "edit"; set: FavoriteSet } | null;

export default function SettingsScreen({
    initialSets,
    settings,
}: {
    initialSets: FavoriteSet[];
    settings: AppSettings;
}) {
    const [editor, setEditor] = useState<EditorState>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { setTheme } = useTheme();

    // initialSets обновляется автоматически: Server Actions ниже ревалидируют layout,
    // и React перерисовывает эту страницу с новыми данными в том же ответе.
    const sets = initialSets;

    function handleSave(input: FavoriteSetInput) {
        setError(null);
        startTransition(async () => {
            try {
                if (editor?.mode === "edit") {
                    await updateFavoriteSet(editor.set.id, input);
                } else {
                    await createFavoriteSet(input);
                }
                setEditor(null);
            } catch (e) {
                setError((e as Error).message);
            }
        });
    }

    function handleDelete(id: string) {
        if (!window.confirm("Удалить набор?")) return;
        startTransition(async () => {
            await deleteFavoriteSet(id);
        });
    }

    function handleMove(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= sets.length) return;
        const next = [...sets];
        [next[index], next[target]] = [next[target], next[index]];
        startTransition(async () => {
            await reorderFavoriteSets(next.map((s) => s.id));
        });
    }

    return (
        <div className="flex flex-col gap-6 p-4 pb-8">
            <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Общие</h2>
                <div className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
                    <label className="flex items-center justify-between gap-3">
                        <span>Основная валюта</span>
                        <select
                            defaultValue={settings.mainCurrency}
                            onChange={(e) => {
                                const mainCurrency = e.target.value;
                                startTransition(async () => {
                                    await updateAppSettings({ mainCurrency });
                                });
                            }}
                            className="rounded-lg bg-zinc-100 px-2 py-1 text-sm font-medium dark:bg-zinc-800"
                        >
                            {SUPPORTED_CURRENCIES.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center justify-between gap-3">
                        <span>Тема</span>
                        <select
                            defaultValue={settings.theme}
                            onChange={(e) => {
                                const theme = e.target.value;
                                setTheme(theme);
                                startTransition(async () => {
                                    await updateAppSettings({ theme });
                                });
                            }}
                            className="rounded-lg bg-zinc-100 px-2 py-1 text-sm font-medium dark:bg-zinc-800"
                        >
                            <option value="system">Системная</option>
                            <option value="light">Светлая</option>
                            <option value="dark">Тёмная</option>
                        </select>
                    </label>
                </div>
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Наборы валют</h2>
                    {!editor && (
                        <button
                            type="button"
                            onClick={() => {
                                setError(null);
                                setEditor({ mode: "create" });
                            }}
                            className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400"
                        >
                            <i className="ti ti-plus" aria-hidden />
                            Добавить
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    {sets.map((set, index) => (
                        <div
                            key={set.id}
                            className="flex items-center gap-3 rounded-2xl border border-black/10 p-3 dark:border-white/10"
                        >
                            <i className={`ti ti-${set.icon} text-xl text-zinc-500`} aria-hidden />
                            <div className="flex min-w-0 flex-col">
                                <span className="font-medium">{set.name}</span>
                                <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                    {set.currencyCodes.join(", ")}
                                </span>
                            </div>
                            <div className="ml-auto flex items-center gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => handleMove(index, -1)}
                                    disabled={index === 0}
                                    className="p-1.5 text-zinc-500 disabled:opacity-30"
                                    aria-label="Переместить выше"
                                >
                                    <i className="ti ti-chevron-up" aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMove(index, 1)}
                                    disabled={index === sets.length - 1}
                                    className="p-1.5 text-zinc-500 disabled:opacity-30"
                                    aria-label="Переместить ниже"
                                >
                                    <i className="ti ti-chevron-down" aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError(null);
                                        setEditor({ mode: "edit", set });
                                    }}
                                    className="p-1.5 text-blue-600 dark:text-blue-400"
                                    aria-label="Редактировать"
                                >
                                    <i className="ti ti-pencil" aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(set.id)}
                                    className="p-1.5 text-red-600 dark:text-red-400"
                                    aria-label="Удалить"
                                >
                                    <i className="ti ti-trash" aria-hidden />
                                </button>
                            </div>
                        </div>
                    ))}
                    {sets.length === 0 && !editor && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Пока нет ни одного набора</p>
                    )}
                </div>

                {editor && (
                    <FavoriteSetForm
                        key={editor.mode === "edit" ? editor.set.id : "create"}
                        initial={editor.mode === "edit" ? editor.set : null}
                        error={error}
                        pending={isPending}
                        onCancel={() => {
                            setEditor(null);
                            setError(null);
                        }}
                        onSave={handleSave}
                    />
                )}
            </section>
        </div>
    );
}
