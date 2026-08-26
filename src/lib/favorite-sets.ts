"use server";

import { prisma } from "@/lib/prisma";
import { SUPPORTED_CURRENCIES } from "@/lib/rates";
import { revalidatePath } from "next/cache";
import type { FavoriteSet } from "@prisma/client";

export type FavoriteSetInput = {
    name: string;
    icon?: string;
    currencyCodes: string[];
    baseCurrency?: string | null;
};

export async function getFavoriteSets(): Promise<FavoriteSet[]> {
    return prisma.favoriteSet.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getFavoriteSet(id: string): Promise<FavoriteSet | null> {
    return prisma.favoriteSet.findUnique({ where: { id } });
}

function normalizeInput(input: FavoriteSetInput) {
    const name = input.name.trim();
    if (!name) throw new Error("Название набора обязательно");
    if (name.length > 40) throw new Error("Название набора слишком длинное");

    const currencyCodes = [...new Set(input.currencyCodes)];
    if (currencyCodes.length < 2) {
        throw new Error("Нужно минимум 2 валюты в наборе");
    }
    for (const code of currencyCodes) {
        if (!SUPPORTED_CURRENCIES.includes(code)) {
            throw new Error(`Валюта ${code} не поддерживается`);
        }
    }

    if (input.baseCurrency && !SUPPORTED_CURRENCIES.includes(input.baseCurrency)) {
        throw new Error(`Валюта ${input.baseCurrency} не поддерживается`);
    }

    return {
        name,
        icon: input.icon?.trim() || undefined,
        currencyCodes,
        baseCurrency: input.baseCurrency ?? null,
    };
}

export async function createFavoriteSet(input: FavoriteSetInput): Promise<FavoriteSet> {
    const data = normalizeInput(input);
    const sortOrder = await prisma.favoriteSet.count();

    const set = await prisma.favoriteSet.create({
        data: { ...data, sortOrder },
    });

    revalidatePath("/", "layout");
    return set;
}

export async function updateFavoriteSet(id: string, input: FavoriteSetInput): Promise<FavoriteSet> {
    const data = normalizeInput(input);

    const set = await prisma.favoriteSet.update({
        where: { id },
        data,
    });

    revalidatePath("/", "layout");
    return set;
}

export async function deleteFavoriteSet(id: string): Promise<void> {
    await prisma.favoriteSet.delete({ where: { id } });
    revalidatePath("/", "layout");
}

export async function reorderFavoriteSets(orderedIds: string[]): Promise<void> {
    await prisma.$transaction(
        orderedIds.map((id, index) =>
            prisma.favoriteSet.update({ where: { id }, data: { sortOrder: index } })
        )
    );
    revalidatePath("/", "layout");
}
