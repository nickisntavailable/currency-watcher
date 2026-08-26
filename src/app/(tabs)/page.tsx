import { getLatestRates } from "@/lib/rates";
import ConverterScreen from "@/components/ConverterScreen";

// Наборы валют читаются через Prisma (не fetch), поэтому не участвуют в кэше fetch()
// автоматически — задаём revalidate явно, чтобы страница не застряла на build-time
// снепшоте в проде.
export const revalidate = 3600;

export default async function ConverterPage() {
    const rates = await getLatestRates("USD");
    return <ConverterScreen rates={rates} />;
}
