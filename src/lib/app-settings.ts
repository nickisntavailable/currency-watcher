"use server";

import { prisma } from "@/lib/prisma";
import { SUPPORTED_CURRENCIES } from "@/lib/rates";
import { revalidatePath } from "next/cache";
import type { AppSettings } from "@prisma/client";

const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export async function getAppSettings(): Promise<AppSettings> {
    return prisma.appSettings.upsert({
        where: { id: "singleton" },
        update: {},
        create: { id: "singleton" },
    });
}

export type AppSettingsInput = Partial<{
    theme: string;
    mainCurrency: string;
    defaultSetId: string | null;
}>;

export async function updateAppSettings(input: AppSettingsInput): Promise<AppSettings> {
    if (input.theme !== undefined && !THEMES.includes(input.theme as Theme)) {
        throw new Error(`Неизвестная тема: ${input.theme}`);
    }
    if (input.mainCurrency !== undefined && !SUPPORTED_CURRENCIES.includes(input.mainCurrency)) {
        throw new Error(`Валюта ${input.mainCurrency} не поддерживается`);
    }

    const settings = await prisma.appSettings.upsert({
        where: { id: "singleton" },
        update: input,
        create: { id: "singleton", ...input },
    });

    revalidatePath("/", "layout");
    return settings;
}
