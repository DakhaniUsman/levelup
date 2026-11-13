import HunterSidebar from "@/components/layout/HunterSidebar";
import HunterHeader from "@/components/layout/HunterHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#090A0F] text-[#F1F5F9]">
      <HunterSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <HunterHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
