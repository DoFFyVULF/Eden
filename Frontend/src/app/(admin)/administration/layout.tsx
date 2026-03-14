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

  useEffect(() => {
    document.body.classList.add("admin-layout-body");
    return () => {
      document.body.classList.remove("admin-layout-body");
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
    return (
      <div className={`${pangolin.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryProvider>
      <div className={`${pangolin.className} min-h-screen bg-gradient-to-br from-slate-50 to-blue-50`}>
        {isAuth ? (
          <div className="flex flex-col min-h-screen">
            <TopNavBar isAdmin={true} />
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