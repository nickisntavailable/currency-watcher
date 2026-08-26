import { getLatestRates } from "@/lib/rates";
import ConverterScreen from "@/components/ConverterScreen";

export default async function ConverterPage() {
    const rates = await getLatestRates("USD");
    return <ConverterScreen rates={rates} />;
}
