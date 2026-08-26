import { prisma } from "@/lib/prisma";
import { getCbrUsdToRub } from "@/lib/cbr";

const FRANKFURTER_BASE = "https://api.frankfurter.dev/v1";

export const SUPPORTED_CURRENCIES = [
    "USD", "EUR", "RUB", "AED", "THB", "GBP", "JPY", "CNY", "TRY",
];

// Валюты, которых нет в Frankfurter/ECB и которые требуют особой обработки
const AED_PEG_TO_USD = 3.6725; // официальная фиксированная привязка ОАЭ с 1997 года

type FrankfurterResponse = {
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
};

/**
 * "Пивот"-курсы: сколько единиц каждой валюты за 1 USD.
 * Все остальные пары считаются через эти значения.
 */
async function getUsdPivotRates(date?: Date): Promise<Record<string, number>> {
    const frankfurterCurrencies = SUPPORTED_CURRENCIES.filter(
        (c) => c !== "USD" && c !== "RUB" && c !== "AED"
    );

    const symbols = frankfurterCurrencies.join(",");
    const dateSegment = date
        ? date.toISOString().split("T")[0]
        : "latest";

    const res = await fetch(
        `${FRANKFURTER_BASE}/${dateSegment}?base=USD&symbols=${symbols}`,
        { next: { revalidate: date ? false : 3600 } }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch Frankfurter rates");
    }

    const data: FrankfurterResponse = await res.json();
    const usdToRub = await getCbrUsdToRub(date ?? new Date());

    return {
        ...data.rates,
        USD: 1,
        AED: AED_PEG_TO_USD,
        RUB: usdToRub,
    };
}

/**
 * Текущие курсы всех поддерживаемых валют относительно произвольной base.
 */
export async function getLatestRates(base: string): Promise<Record<string, number>> {
    const pivot = await getUsdPivotRates();
    const result: Record<string, number> = {};

    for (const code of SUPPORTED_CURRENCIES) {
        result[code] = pivot[code] / pivot[base];
    }

    return result;
}

// Экраны "Месяц"/"Тренды" запрашивают исторические курсы сразу для всех валют набора
// на конкретную дату. Раньше это делалось по одной валюте за раз — для набора из
// нескольких валют и нескольких дат превращалось в десятки последовательных запросов
// к Frankfurter, плюс параллельные check-then-create по одному и тому же (code, base,
// date) ключу давали гонку. Здесь один поход в БД за уже закэшированными валютами,
// один батч-запрос к Frankfurter за недостающими и один upsert-транзакция для записи.
export async function getRatesOnDate(date: Date): Promise<Record<string, number>> {
    const dateOnly = new Date(date.toISOString().split("T")[0]);
    const frankfurterCurrencies = SUPPORTED_CURRENCIES.filter(
        (c) => c !== "USD" && c !== "RUB" && c !== "AED"
    );

    const cachedRows = await prisma.rateSnapshot.findMany({
        where: {
            base: "USD",
            date: dateOnly,
            code: { in: [...frankfurterCurrencies, "RUB"] },
        },
    });
    const cachedByCode = new Map(cachedRows.map((r) => [r.code, r.rate]));

    const result: Record<string, number> = { USD: 1, AED: AED_PEG_TO_USD };
    const toCache: { code: string; rate: number }[] = [];

    const missingFrankfurter = frankfurterCurrencies.filter((code) => !cachedByCode.has(code));
    for (const code of frankfurterCurrencies) {
        const cached = cachedByCode.get(code);
        if (cached !== undefined) result[code] = cached;
    }

    if (missingFrankfurter.length > 0) {
        const dateStr = dateOnly.toISOString().split("T")[0];
        const res = await fetch(
            `${FRANKFURTER_BASE}/${dateStr}?base=USD&symbols=${missingFrankfurter.join(",")}`
        );
        if (!res.ok) throw new Error("Failed to fetch historical Frankfurter rates");
        const data: FrankfurterResponse = await res.json();
        for (const code of missingFrankfurter) {
            result[code] = data.rates[code];
            toCache.push({ code, rate: data.rates[code] });
        }
    }

    const cachedRub = cachedByCode.get("RUB");
    if (cachedRub !== undefined) {
        result.RUB = cachedRub;
    } else {
        const rubRate = await getCbrUsdToRub(dateOnly);
        result.RUB = rubRate;
        toCache.push({ code: "RUB", rate: rubRate });
    }

    if (toCache.length > 0) {
        await prisma.$transaction(
            toCache.map(({ code, rate }) =>
                prisma.rateSnapshot.upsert({
                    where: { code_base_date: { code, base: "USD", date: dateOnly } },
                    update: { rate },
                    create: { code, base: "USD", date: dateOnly, rate },
                })
            )
        );
    }

    return result;
}

export async function getRateOnDate(code: string, base: string, date: Date): Promise<number> {
    const pivot = await getRatesOnDate(date);
    return pivot[code] / pivot[base];
}

export async function getRateChange(code: string, base: string, daysAgo: number): Promise<number> {
    const currentRates = await getLatestRates(base);
    const current = currentRates[code];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysAgo);
    const past = await getRateOnDate(code, base, pastDate);

    return ((current - past) / past) * 100;
}