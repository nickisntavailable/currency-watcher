import SetChips from "@/components/SetChips";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1 flex-col">
            <SetChips />
            <div className="flex-1">{children}</div>
        </div>
    );
}
