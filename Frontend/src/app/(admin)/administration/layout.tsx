"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryProvider } from "@/app/providers/QueryProvider";
import AsideMenu from "@/app/components/ui/admin/asideMenu/asideMenu";
import { getAccessToken } from "@/services/auth/auth-token.service";
import { axiosWithAuth } from "@/api/interceptors";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Добавляем класс на body при загрузке админки
    document.body.classList.add('admin-layout-body');
    
    return () => {
      // Убираем класс при уходе с админки
      document.body.classList.remove('admin-layout-body');
    };
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
      <div className="admin-layout min-h-screen bg-white">
        {isAuth && (
          <>
            <div className="hidden lg:flex">
              <div className="flex-none">
                <AsideMenu isAdmin={true} />
              </div>
              <main className="flex-1 p-6 lg:p-8 overflow-auto bg-white">
                {children}
              </main>
            </div>
            
            <div className="lg:hidden bg-white">
              <AsideMenu isAdmin={true} />
              <main className="p-4 pt-0 bg-white">
                {children}
              </main>
            </div>
          </>
        )}

        {!isAuth && (
          <div className="w-full p-6 bg-white min-h-screen">
            {children}
          </div>
        )}
      </div>
    </QueryProvider>
  );
}