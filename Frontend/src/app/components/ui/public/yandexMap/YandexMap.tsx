import React from 'react';

interface YandexMapProps {
  className?: string;
}

export default function YandexMap({ className }: YandexMapProps) {
  return (
    <div className={`relative w-full h-full min-h-[380px] ${className || ''}`}>
      <iframe
        src="https://yandex.ru/map-widget/v1/?ll=56.380499%2C58.108191&mode=poi&poi%5Bpoint%5D=56.380339%2C58.108049&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D1074988062&utm_campaign=desktop&utm_medium=search&utm_source=maps&z=19.92"
        width="100%"
        height="100%"
        allowFullScreen
        loading="lazy" // Браузер загрузит карту только когда она появится near viewport
        title="Карта салона Эден"
        className="absolute inset-0 w-full h-full border-0 rounded-[30px]"
        style={{ 
          filter: "grayscale(100%) sepia(18%) brightness(1.02)" 
        }}
      />
    </div>
  );
}