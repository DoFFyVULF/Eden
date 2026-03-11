"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryProvider } from "@/app/providers/QueryProvider";
import AsideMenu from "@/app/components/ui/admin/asideMenu/asideMenu";
import { getAccessToken } from "@/services/auth/auth-token.service";
import { axiosWithAuth } from "@/api/interceptors";

export default function MasterRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkAuth = async () => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setIsAuth(false);
      setLoaded(true);
      return;
    }

    try {
      await axiosWithAuth.get("/auth/me");
      setIsAuth(true);
    } catch {
      setIsAuth(false);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-changed", checkAuth);

    return () => {
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, [pathname]);

  if (!loaded) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <QueryProvider>
      <div className="min-h-screen master-layout bg-gray-50">
        {isAuth && (
          <>
            {/* Для десктопа - aside занимает часть экрана */}
            <div className="hidden lg:flex">
              <div className="flex-none">
                <AsideMenu isAdmin={false} />
              </div>
              <main className="flex-1 p-6 lg:p-8 overflow-auto">
                {children}
              </main>
            </div>
            
            {/* Для мобилки - контент занимает весь экран */}
            <div className="lg:hidden">
              <AsideMenu isAdmin={false} />
              <main className="p-4 pt-0">
                {children}
              </main>
            </div>
          </>
        )}

        {/* Если не авторизован */}
        {!isAuth && (
          <div className="w-full p-6">
            {children}
          </div>
        )}
      </div>
    </QueryProvider>
  );
}