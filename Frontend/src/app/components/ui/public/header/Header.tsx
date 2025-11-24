import { routes } from "@/app/lib/routes";

export default function Header() {
  return (
    <header className="max-w-[1400px] h-[115px] mx-auto w-full px-4 bg-black">
      <div className="flex justify-center items-center gap-3">
        <a href={routes.SERVICES}>Услуги</a>
        <a href={routes.HOME}>
          <video src="/Logo.mp4" width={200} height={300} autoPlay muted />
        </a>
        <a href={routes.APPOINTMENT}>Запись</a>
      </div>
    </header>
  );
}
