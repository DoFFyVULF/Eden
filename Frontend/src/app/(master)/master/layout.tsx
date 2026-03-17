"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryProvider } from "@/app/providers/QueryProvider";
import AsideMenu from "@/app/components/ui/admin/Navigation/asideMenu";
import { getAccessToken } from "@/services/auth/auth-token.service";
import { axiosWithAuth } from "@/api/interceptors";
import { Pangolin } from "next/font/google";
import TopNavBar from "@/app/components/ui/admin/Navigation/TopNavBar";

const pangolin = Pangolin({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  display: "swap",
});




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
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
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
      <div
        className={`${pangolin.className} min-h-screen bg-gradient-to-br from-slate-50 to-blue-50`}
      >
        {isAuth ? (
          <div className="flex flex-col min-h-screen">
            <TopNavBar isAdmin={false} />
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
