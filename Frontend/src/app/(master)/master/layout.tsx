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

    // 🔥 слушаем login / logout
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
      <div className="bg-white min-h-screen flex ">
        {isAuth && (
          <aside className="w-1/5 flex flex-col border-r border-gray-200">
            <AsideMenu isAdmin={false} />
          </aside>
        )}

        <div
          className={`${
            isAuth ? "w-4/5 p-6 overflow-auto" : "w-full p-6"
          } transition-all duration-300`}
        >
          {children}
        </div>
      </div>
    </QueryProvider>
  );
}
