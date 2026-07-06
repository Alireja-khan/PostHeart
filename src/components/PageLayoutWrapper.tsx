"use client";

import { usePathname } from "next/navigation";

export default function PageLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // We don't want the pt-40 padding on the profile page, board page, auth pages, or letter pages
  const noPaddingPages = ["/profile", "/login", "/register"];
  const isLetterPage = pathname?.startsWith("/letter") || false;
  const shouldAddPadding = !noPaddingPages.includes(pathname || "") && !isLetterPage;
  
  return (
    <div className={shouldAddPadding ? "pt-40 min-h-full" : "min-h-full"}>
      {children}
    </div>
  );
}
