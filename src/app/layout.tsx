import type { Metadata } from "next";
import { Lora, Caveat } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Providers } from "@/components/Providers";
import TopBar from "@/components/TopBar";
import NotificationSidebar from "@/components/NotificationSidebar";
import GlobalBirdTracker from "@/components/GlobalBirdTracker";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

import PageLayoutWrapper from "@/components/PageLayoutWrapper";

export const metadata: Metadata = {
  title: "Dear You",
  description: "A private, vintage love letter experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-[#111111] text-[#f9f8f6] overflow-hidden">
        <Providers>
          <Sidebar />
          <div className="flex-1 h-full overflow-y-auto relative bg-[#111111]">
            <TopBar />
            <GlobalBirdTracker />
            <PageLayoutWrapper>
              {children}
            </PageLayoutWrapper>
          </div>
          <NotificationSidebar />
        </Providers>
      </body>
    </html>
  );
}
