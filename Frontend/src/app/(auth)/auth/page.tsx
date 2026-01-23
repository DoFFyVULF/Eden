import { QueryProvider } from "@/app/providers/QueryProvider";
import { Auth } from "./Auth";

export default function AuthPage() {
  return (
    <QueryProvider>
      <Auth />
    </QueryProvider>
  );
}
