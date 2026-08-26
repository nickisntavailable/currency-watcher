import { getLatestRates, getRatesOnDate } from "@/lib/rates";
import { getAppSettings } from "@/lib/app-settings";
import TrendsScreen from "@/components/TrendsScreen";

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

export default async function TrendsPage() {
    const [latest, settings, d7, d30, y1] = await Promise.all([
        getLatestRates("USD"),
        getAppSettings(),
        getRatesOnDate(daysAgo(7)),
        getRatesOnDate(daysAgo(30)),
        getRatesOnDate(daysAgo(365)),
    ]);

    return (
        <TrendsScreen
            latest={latest}
            past={{ d7, d30, y1 }}
            mainCurrency={settings.mainCurrency}
        />
    );
}
