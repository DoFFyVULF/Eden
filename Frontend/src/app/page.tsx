import ShinyText from "./animations/ShinyText/ShinyText";
import DomeGallery from "./animations/DomeGallery/DomeGallery";
import StarBorder from "./animations/StarBorder/StarBorder";
import { routes } from "./lib/routes";
import Header from "./components/ui/public/header/Header";
import Footer from "./components/ui/public/footer/Footer";

export default function Home() {
  return (
     <div className="">
      <div className="container">
        <Header/>
        <section className="flex flex-col justify-center items-center mt-30">
          <h1 className="ink-free text-[22rem] text-center max-[1234px]:text-[11rem]">
            Эден
          </h1>
          <div className="relative max-[1234px]:flex max-[1234px]:flex-col max-[1234px]:-top-15">
            <ShinyText
              text="Красота"
              disabled={false}
              speed={3}
              className="text-3xl absolute -top-130 -left-100 -rotate-25 
              max-[1234px]:relative 
              max-[1234px]:top-0 
              max-[1234px]:left-0 
              max-[1234px]:rotate-0
              max-[1234px]:"
            />
            <ShinyText
              text="Ухоженность"
              disabled={false}
              speed={3}
              className="text-3xl absolute -top-130 left-100 rotate-25 
              max-[1234px]:relative 
              max-[1234px]:top-0 
              max-[1234px]:left-0 
              max-[1234px]:rotate-0
              max-[1234px]:pl-18"
            />
            <ShinyText
              text="Преображение"
              disabled={false}
              speed={3}
              className="text-3xl max-[1234px]:pl-36"
            />
          </div>
        </section>

        <section className="py-16 md:py-24">
          <h2 className="text-center text-3xl md:text-5xl font-bold">О нас</h2>
          <div className="mt-20 mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 max-[1024px]:text-center">
                  Мы создаём красоту с заботой и вниманием
                </h2>
                <p className="text-lg mb-4">
                  Салон «Эден» — это пространство, где время замедляется, а вы —
                  в центре всего. С 2018 года мы помогаем нашим гостям
                  чувствовать себя уверенно, ухоженно и по-настоящему красиво.
                </p>
                <p className="text-lg  mb-6">
                  Наши мастера — не просто профессионалы, а вдохновлённые
                  художники, которые подходят к каждому клиенту индивидуально.
                  Мы используем только премиальную косметику и современные
                  техники, чтобы результат радовал вас каждый день.
                </p>
                <div className="flex flex-wrap gap-4 ">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-red-200 mr-2">
                      500+
                    </span>
                    <span className="">довольных клиентов</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-red-200 mr-2">
                      15+
                    </span>
                    <span className="">опытных мастеров</span>
                  </div>
                </div>
              </div>

              <div className="relative mb-2">
                <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <span className=" text-center px-4 text-black">
                    Фото салона / команды
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-screen max-[769px]:h-[700px] pt-6">
            <DomeGallery grayscale={false} />
          </div>
        </section>

        <section className="py-3 md:py-3">
          <div className="mx-auto px-4 max-w-6xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold  mb-6 md:mb-12">
              Наши услуги
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              <StarBorder as="button" className="" color="white" speed="2s">
                <div className=" rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-lg md:text-xl  mb-6">
                    Мы предлагаем широкий спектр услуг — от стрижек и
                    окрашивания до ухода за кожей и ногтями.
                  </p>
                  <a
                    href={routes.SERVICES}
                    className="inline-block bg-amber-600 hover:bg-amber-700  font-medium py-3 px-6 rounded-full transition duration-300"
                  >
                    Посмотреть все услуги
                  </a>
                </div>
              </StarBorder>

              <StarBorder
                as="button"
                className="custom-class"
                color="white"
                speed="5s"
              >
                <div className=" rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-lg md:text-xl  mb-6">
                    Выберите мастера, удобное время и запишитесь онлайн —
                    быстро, просто и без звонков.
                  </p>
                  <a
                    href={routes.APPOINTMENT}
                    className="inline-block bg-indigo-600 hover:bg-indigo-700  font-medium py-3 px-6 rounded-full transition duration-300"
                  >
                    Записаться онлайн
                  </a>
                </div>
              </StarBorder>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto px-4 max-w-6xl">
            <div className="flex flex-col">
              <h2 className="text-center text-3xl md:text-5xl font-bold mb-6 md:mb-12">
                Где нас найти?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                {/* Текстовая информация */}
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold -900 max-[768px]:text-center">
                      Адрес
                    </h3>
                    <p className="text-lg -700 mt-1 max-[768px]:text-center">
                      г. Пермь, ул. Коронита, 15
                      <br />
                      <span className="-600 text-base max-[768px]:text-center">
                        Вход со двора
                      </span>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold -900 max-[768px]:text-center">
                      Режим работы
                    </h3>
                    <p className="text-lg -700 mt-1 max-[768px]:text-center">
                      Ежедневно с 9:00 до 20:00
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold -900 max-[768px]:text-center">
                      Телефон
                    </h3>
                    <p className="text-lg -700 mt-1 max-[768px]:text-center">
                      <a
                        href="tel:+73421234567"
                        className="text-amber-600 hover:underline font-medium "
                      >
                        +7 (342) 123-45-67
                      </a>
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                  <a
                    href="https://yandex.ru/maps/org/dom_parikmakhera_eden/1074988062/?utm_medium=mapframe&utm_source=maps"
                    style={{
                      color: "#eee",
                      fontSize: "12px",
                      position: "absolute",
                      top: "4px",
                      left: "8px",
                      zIndex: 10,
                    }}
                  >
                    Дом парикмахера Эден
                  </a>
                  <a
                    href="https://yandex.ru/maps/50/perm/category/hairdresser/184105812/?utm_medium=mapframe&utm_source=maps"
                    style={{
                      color: "#eee",
                      fontSize: "12px",
                      position: "absolute",
                      top: "20px",
                      left: "8px",
                      zIndex: 10,
                    }}
                  >
                    Парикмахерская в Перми
                  </a>
                  <iframe
                    src="https://yandex.ru/map-widget/v1/?ll=56.380499%2C58.108191&mode=poi&poi%5Bpoint%5D=56.380339%2C58.108049&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D1074988062&utm_campaign=desktop&utm_medium=search&utm_source=maps&z=19.92"
                    width="100%"
                    height="400"
                    allowFullScreen
                    style={{ position: "relative", display: "block" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer/>
      </div>
    </div>
  );
}
