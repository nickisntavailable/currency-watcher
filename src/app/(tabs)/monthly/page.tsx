import { getRatesOnDate } from "@/lib/rates";
import MonthlyScreen from "@/components/MonthlyScreen";

function lastTwelveMonthDates(): Date[] {
    const now = new Date();
    const dates: Date[] = [];
    for (let i = 11; i >= 0; i--) {
        dates.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }
    return dates;
}

export default async function MonthlyPage() {
    const dates = lastTwelveMonthDates();
    const ratesByMonth = await Promise.all(dates.map((d) => getRatesOnDate(d)));

    const months = dates.map((date, i) => ({
        dateIso: date.toISOString(),
        rates: ratesByMonth[i],
    }));

    return <MonthlyScreen months={months} />;
}
