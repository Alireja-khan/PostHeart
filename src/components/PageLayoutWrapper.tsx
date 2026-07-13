"use client";

import { usePathname } from "next/navigation";

export default function PageLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // We don't want the pt-40 padding on the profile page, board page, auth pages, or letter pages
  const noPaddingPages = ["/profile", "/login", "/register"];
  const isLetterPage = pathname?.startsWith("/letter") || false;
  const shouldAddPadding = !noPaddingPages.includes(pathname || "") && !isLetterPage;
  
  return (
    <div 
      className={
        shouldAddPadding 
          ? "pt-16 md:pt-24 h-[calc(100%-4rem)] md:h-[calc(100%-6rem)] overflow-y-auto overflow-x-hidden" 
          : "h-full overflow-y-auto overflow-x-hidden"
      }
    >
      {children}
    </div>
  );
}
