import type { Metadata } from "next";
import { Lora, Caveat, Special_Elite } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Providers } from "@/components/Providers";
import { NotificationProvider } from "@/contexts/NotificationContext";
import TopBar from "@/components/TopBar";
import NotificationSidebar from "@/components/NotificationSidebar";
import GlobalBirdTracker from "@/components/GlobalBirdTracker";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import { Toaster } from 'react-hot-toast';

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const specialElite = Special_Elite({
  weight: "400",
  variable: "--font-special-elite",
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
      className={`${lora.variable} ${caveat.variable} ${specialElite.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-bg-primary text-text-primary overflow-hidden">
        <Providers>
            <Toaster 
              position="top-center" 
              toastOptions={{
                style: {
                  background: '#1a1a1a',
                  color: '#f9f8f6',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontFamily: 'serif'
                }
              }} 
            />
            <Sidebar />
            <div className="flex-1 h-full overflow-hidden relative bg-bg-primary">
              <TopBar />
              <GlobalBirdTracker />
              <PageLayoutWrapper>
                {children}
              </PageLayoutWrapper>
            </div>
            <NotificationSidebar />
            <GlobalAudioPlayer />
        </Providers>
      </body>
    </html>
  );
}
