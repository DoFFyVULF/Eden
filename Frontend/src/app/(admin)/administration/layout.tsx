"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { getAccessToken } from "@/services/auth/auth-token.service";
import { axiosWithAuth } from "@/api/interceptors";
import TopNavBar from "@/app/components/ui/admin/Navigation/TopNavBar";
import { Pangolin } from "next/font/google";

const pangolin = Pangolin({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
});

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  // Принудительно включаем темную тему для теста
  const [isDark, setIsDark] = useState(true); 

  useEffect(() => {
    document.body.classList.add("admin-layout-body");
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => {
      document.body.classList.remove("admin-layout-body");
    };
  }, [isDark]);

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
    return (
      // Убрали bg-классы, оставили только шрифт и dark класс
      <div className={`${pangolin.className} ${isDark ? 'dark' : ''} min-h-screen flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 dark:border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryProvider>
      {/* ВАЖНО: Убрали все bg-gradient... отсюда. Фон теперь берет из body (globals.css) */}
      <div className={`${pangolin.className} ${isDark ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
        {isAuth ? (
          <div className="flex flex-col min-h-screen">
            <TopNavBar isAdmin={true} />
            {/* main тоже без фона, прозрачный */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 pt-10 lg:pt-12">
              {children}
            </main>
          </div>
        ) : (
          <div className="w-full min-h-screen">{children}</div>
        )}
      </div>
    </QueryProvider>
  );
}