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
      suppressHydrationWarning
      className={`${lora.variable} ${caveat.variable} ${specialElite.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var origSet = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (name === 'bis_skin_checked') return;
                    return origSet.apply(this, arguments);
                  };

                  var origErr = console.error;
                  console.error = function() {
                    for (var k = 0; k < arguments.length; k++) {
                      var a = arguments[k];
                      if (typeof a === 'string' && a.indexOf('bis_skin_checked') !== -1) {
                        return;
                      }
                    }
                    return origErr.apply(console, arguments);
                  };

                  var clean = function(el) {
                    if (!el || el.nodeType !== 1) return;
                    if (el.hasAttribute('bis_skin_checked')) el.removeAttribute('bis_skin_checked');
                    if (el.querySelectorAll) {
                      var list = el.querySelectorAll('[bis_skin_checked]');
                      for (var i = 0; i < list.length; i++) {
                        list[i].removeAttribute('bis_skin_checked');
                      }
                    }
                  };
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                        if (m.target && m.target.hasAttribute && m.target.hasAttribute('bis_skin_checked')) {
                          m.target.removeAttribute('bis_skin_checked');
                        }
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          clean(m.addedNodes[j]);
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['bis_skin_checked'],
                    childList: true,
                    subtree: true
                  });
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning className="h-full flex bg-bg-primary text-text-primary overflow-hidden">
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
            <div suppressHydrationWarning className="flex-1 h-full overflow-hidden relative bg-bg-primary">
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
