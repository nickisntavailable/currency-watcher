import { NextResponse } from "next/server";
import { getLatestRates } from "@/lib/rates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base") ?? "USD";

  try {
    const rates = await getLatestRates(base);
    return NextResponse.json({ rates, base });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 502 });
  }
}