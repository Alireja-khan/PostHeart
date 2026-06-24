"use client";

import { usePathname } from "next/navigation";

export default function PageLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // We don't want the pt-40 padding on the profile page, board page, or auth pages
  const noPaddingPages = ["/profile", "/login", "/register"];
  const shouldAddPadding = !noPaddingPages.includes(pathname || "");
  
  return (
    <div className={shouldAddPadding ? "pt-40 min-h-full" : "min-h-full"}>
      {children}
    </div>
  );
}
