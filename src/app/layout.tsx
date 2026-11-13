import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import GlowCursor from "@/components/ui/GlowCursor";

export const metadata: Metadata = {
  title: "LEVEL UP — Personal Life Operating System",
  description: "Futuristic RPG Personal Progression & Life OS",
  icons: {
    icon: "/swords.jpg",
    shortcut: "/swords.jpg",
    apple: "/swords.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#090A0F] text-[#F1F5F9] font-sans selection:bg-[#00F0FF]/30 selection:text-[#00F0FF]">
        <GlowCursor
          color="#00F0FF"
          secondaryColor="#8A2BE2"
          intensity={1.3}
          trailWidth={3.5}
          linger={1.4}
          glow={1.2}
          clickBurst
          theme="dark"
        >
          <Providers>{children}</Providers>
        </GlowCursor>
      </body>
    </html>
  );
}
