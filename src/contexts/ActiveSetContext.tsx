"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FavoriteSet } from "@prisma/client";

const STORAGE_KEY = "currency-watcher:active-set-id";

type ActiveSetContextValue = {
    sets: FavoriteSet[];
    activeSet: FavoriteSet | null;
    activeSetId: string | null;
    setActiveSetId: (id: string) => void;
};

const ActiveSetContext = createContext<ActiveSetContextValue | null>(null);

export function ActiveSetProvider({
    sets,
    defaultSetId,
    children,
}: {
    sets: FavoriteSet[];
    defaultSetId: string | null;
    children: ReactNode;
}) {
    const [activeSetId, setActiveSetIdState] = useState<string | null>(
        defaultSetId ?? sets[0]?.id ?? null
    );

    // Читаем сохранённый выбор из localStorage только после маунта, чтобы разметка
    // первого рендера совпадала с серверной (без гидратационных расхождений). Это
    // синхронизация с внешним хранилищем, а не производное от пропсов состояние —
    // законный случай для useEffect, в отличие от паттернов "adjust state on prop
    // change" в других компонентах. Намеренно запускаем только один раз при маунте.
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored && sets.some((s) => s.id === stored)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setActiveSetIdState(stored);
            }
        } catch {
            // localStorage недоступен (приватный режим и т.п.) — остаёмся на дефолте
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setActiveSetId = useCallback((id: string) => {
        setActiveSetIdState(id);
        try {
            window.localStorage.setItem(STORAGE_KEY, id);
        } catch {
            // ignore
        }
    }, []);

    const activeSet = useMemo(
        () => sets.find((s) => s.id === activeSetId) ?? sets[0] ?? null,
        [sets, activeSetId]
    );

    const value = useMemo<ActiveSetContextValue>(
        () => ({ sets, activeSet, activeSetId: activeSet?.id ?? null, setActiveSetId }),
        [sets, activeSet, setActiveSetId]
    );

    return <ActiveSetContext.Provider value={value}>{children}</ActiveSetContext.Provider>;
}

export function useActiveSet(): ActiveSetContextValue {
    const ctx = useContext(ActiveSetContext);
    if (!ctx) throw new Error("useActiveSet должен вызываться внутри ActiveSetProvider");
    return ctx;
}
