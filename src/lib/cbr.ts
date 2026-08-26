// ЦБ РФ отдаёт XML в кодировке windows-1251, но нас интересуют только
// ASCII-поля (коды валют, числа), они не портятся при UTF-8 декодировании —
// поэтому обычного text() и regex-парсинга достаточно, без библиотек XML/кодировок.

export async function getCbrUsdToRub(date: Date): Promise<number> {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    const res = await fetch(
        `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${dd}/${mm}/${yyyy}`,
        { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch CBR rates");
    }

    const xml = await res.text();
    const usdBlock = xml.match(/<Valute[^>]*>(?:(?!<\/Valute>)[\s\S])*<CharCode>USD<\/CharCode>[\s\S]*?<\/Valute>/);

    if (!usdBlock) {
        throw new Error("USD rate not found in CBR response");
    }

    const nominal = usdBlock[0].match(/<Nominal>(\d+)<\/Nominal>/)?.[1];
    const value = usdBlock[0].match(/<Value>([\d,]+)<\/Value>/)?.[1];

    if (!nominal || !value) {
        throw new Error("Failed to parse CBR USD rate");
    }

    return parseFloat(value.replace(",", ".")) / parseInt(nominal, 10);
}