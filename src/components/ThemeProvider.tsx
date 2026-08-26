"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export default function ThemeProvider({
    defaultTheme,
    children,
}: {
    defaultTheme: string;
    children: ReactNode;
}) {
    return (
        <NextThemesProvider attribute="class" defaultTheme={defaultTheme} enableSystem>
            {children}
        </NextThemesProvider>
    );
}
