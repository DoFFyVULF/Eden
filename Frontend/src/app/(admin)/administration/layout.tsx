"use client";

import { useEffect, useState } from "react";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { EnumTokens } from "@/services/auth/auth-token.service";
import AsideMenu from "@/app/components/ui/admin/asideMenu/asideMenu";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = Cookies.get(EnumTokens.REFRESH_TOKEN);
    setIsAuth(!!token);
    setLoaded(true); // флаг, что проверка завершена
  }, []);

  if (!loaded) {
    return <div>Loading...</div>; // или skeleton
  }

  const showAside = isAuth === true;

  return (
    <QueryProvider>
      <div className="bg-white min-h-screen flex">

        {showAside && (
            <aside className="w-1/5 flex flex-col border-r border-gray-200">
            <AsideMenu />
          </aside>
        )}
        
      
        <div
          className={`${
            showAside ? "w-4/5 p-6 overflow-auto" : "w-full"
          } transition-all duration-300`}
        >
          {children}
        </div>
      </div>
    </QueryProvider>
  );
}
