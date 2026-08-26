import { getFavoriteSets } from "@/lib/favorite-sets";
import { getAppSettings } from "@/lib/app-settings";
import SettingsScreen from "@/components/SettingsScreen";

export default async function SettingsPage() {
    const [sets, settings] = await Promise.all([getFavoriteSets(), getAppSettings()]);
    return <SettingsScreen initialSets={sets} settings={settings} />;
}
