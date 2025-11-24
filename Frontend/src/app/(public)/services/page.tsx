"use client";
import { category, services } from "@/app/data/services/services.data";
import { useState } from "react";
import ServiceCard from "./serviceCard";

export default function Service() {
  const [isSelect, setIsSelect] = useState<number | null>(null);

  const selectCategory = (id: number) => {
    setIsSelect(id);
  };

  const fillteredService = isSelect ? services.filter(service => service.categoryId === isSelect) : services;

  return (
    <div className="container">
      <section>
        <h1 className="text-center text-3xl md:text-5xl font-bold">
          Наши услуги
        </h1>
        <div className="flex flex-row flex-wrap justify-evenly mt-8">
          {category.map((category) => (
            <button
              key={category.id}
              onClick={() => selectCategory(category.id)}
              className={`relative px-4 py-2 transition-all ease-in-out ${
                isSelect === category.id ? "" : "opacity-70"
              }`}
            >
              {category.title}
              {isSelect === category.id && (
                <>
                  <span className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-blue" />
                  <span className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-blue" />
                </>
              )}
            </button>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <div className="flex flex-row flex-wrap justify-around gap-3.5">
          {fillteredService.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              title={service.title}
              img={service.img}
              duration={service.duration}
              price={service.price}
              isAppointment={true}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
