"use client";
import { useState, useEffect } from "react";
import { category, services } from "@/app/data/services/services.data";
import { masters } from "@/app/data/services/masters.data";
import { masterServices } from "@/app/data/services/masterService.data";
import { masterSchedule } from "@/app/data/services/masterSchedule.data";
import { weekdaysOrder } from "@/app/data/services/weekdays.data";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";
import ServiceCard from "../services/serviceCard";
import MasterCard from "../services/masterCard";
import { CalendarTimeSelector } from "@/app/components/ui/public/appointment/TimeSelection";
import NotificationWindow from "@/app/components/ui/public/appointment/NotificationWindow";

interface AppointmentData {
  masterId: number;
  day: string;
  time: string;
}

interface FormData {
  lastName: string;
  firstName: string;
  phone: string;
  comment: string;
}

export default function Appointment() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [selectedDateFromCalendar, setSelectedDateFromCalendar] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    lastName: "",
    firstName: "",
    phone: "",
    comment: ""
  });

  // Сбрасываем выбранное время при смене мастера
  useEffect(() => {
    setSelectedAppointment(null);
  }, [selectedMasterId]);

  // Обработчики выбора
  const handleCategorySelect = (id: number) => {
    setSelectedCategory(id);
    setSelectedService(null);
    setSelectedMasterId(null);
  };

  const handleServiceSelect = (id: number) => {
    setSelectedService(prev => prev === id ? null : id);
    setSelectedMasterId(null);
  };

  const handleMasterSelect = (id: number) => {
    setSelectedMasterId(prev => prev === id ? null : id);
  };

  const handleDateSelect = (date: Date | null) => {
    setSelectedDateFromCalendar(date);
  };

  const handleTimeClick = (masterId: number, day: string, time: string) => {
    setSelectedAppointment({ masterId, day, time });
  };

  // Обработчики формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Здесь будет логика отправки данных
    console.log({
      service: currentService,
      master: selectedMaster,
      appointment: selectedAppointment,
      client: formData
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  const handleCloseNotification = () => {
    setIsSuccess(false);
    setSelectedAppointment(null);
    setSelectedMasterId(null);
    setSelectedService(null);
    setSelectedCategory(null);
    setFormData({ lastName: "", firstName: "", phone: "", comment: "" });
  };

  // Получение данных
  const currentService = services.find(service => service.id === selectedService);
  const selectedMaster = masters.find(master => master.id === selectedMasterId);
  
  const filteredServices = services.filter(
    service => service.categoryId === selectedCategory
  );

  const displayServices = selectedService
    ? filteredServices.filter(service => service.id === selectedService)
    : filteredServices;

  const mastersForSelectedService = selectedService
    ? masterServices.filter(master => master.serviceIds.includes(selectedService))
    : [];

  const selectedMasterSchedule = selectedMasterId
    ? masterSchedule.find(master => master.masterId === selectedMasterId) ?? null
    : null;

  return (
    <div className="container">

      {/* Выбор категории */}
      <div className="text-center">
        <div className="flex flex-row flex-wrap justify-evenly mt-5">
          {category.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`relative px-4 py-2 transition-all ease-in-out ${
                selectedCategory === cat.id ? "" : "opacity-70"
              }`}
            >
              {cat.title}
              {selectedCategory === cat.id && (
                <>
                  <span className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-blue" />
                  <span className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-blue" />
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка услуг и мастеров */}
      <div className="flex flex-wrap justify-center gap-12 max-[1158px]:justify-center max-[1158px]:gap-8">
        {/* Услуги */}
        <div className="flex flex-row flex-wrap justify-around gap-3.5 mt-10">
          {selectedCategory ? (
            displayServices.length > 0 ? (
              displayServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  img={service.img}
                  duration={service.duration}
                  price={service.price}
                  isAppointment={false}
                  isSelected={selectedService === service.id}
                  onSelect={() => handleServiceSelect(service.id)}
                />
              ))
            ) : (
              <p className="text-gray-400">В этой категории пока нет услуг.</p>
            )
          ) : (
            <p className="text-gray-400">Выберите категорию</p>
          )}
        </div>

        {/* Мастера */}
        <div className="flex flex-col gap-3 mt-8">
          {selectedService && displayServices.length > 0 && (
            <h2 className="text-center text-lg font-semibold text-white/90">
              Выберите мастера
            </h2>
          )}

          {mastersForSelectedService.length > 0 ? (
            mastersForSelectedService.map((master) => {
              const masterData = masters.find(m => m.id === master.masterId);
              if (!masterData) return null;

              return (
                <MasterCard
                  key={master.masterId}
                  name={masterData.name}
                  specialty={masterData.specialty}
                  photo={masterData.photo}
                  isSelected={selectedMasterId === master.masterId}
                  onSelect={() => handleMasterSelect(master.masterId)}
                />
              );
            })
          ) : selectedService ? (
            <p className="text-center text-gray-400 mt-4">
              Нет доступных мастеров для этой услуги.
            </p>
          ) : null}
        </div>

        {/* Календарь и время */}
        {selectedService && selectedMasterId && (
          <CalendarTimeSelector
            selectedMasterId={selectedMasterId}
            selectedMasterSchedule={selectedMasterSchedule}
            onDateSelect={handleDateSelect}
            handleTimeClick={handleTimeClick}
            selectedAppointment={selectedAppointment}
          />
        )}
      </div>

      {/* Форма записи */}
      {selectedService && selectedMasterId && selectedAppointment && (
        <form onSubmit={handleSubmit} className="flex justify-center mb-10">
          <div className="max-w-1/2 flex flex-col mt-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              📋 Данные для записи
            </h2>

            <div className="space-y-4">
              {/* Информация о записи */}
              <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Услуга:</span>
                    <p className="text-white font-medium">{currentService?.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Время:</span>
                    <p className="text-white font-medium">
                      {selectedAppointment.time},{" "}
                      {weekdaysOrder.find(day => day.key === selectedAppointment.day)?.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Стоимость:</span>
                    <p className="text-emerald-400 font-medium">{currentService?.price} ₽</p>
                  </div>
                </div>
              </div>

              {/* Поля формы */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Введите фамилию"
                    />
                  </div>

                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Введите имя"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="+7 (___) ___-__-__"
                    maxLength={18}
                  />
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                    Комментарий к записи
                    <span className="text-gray-500 text-xs ml-1">(необязательно)</span>
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Дополнительные пожелания или комментарии..."
                  />
                </div>
              </div>

              {/* Кнопка отправки */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                >
                  {isSubmitting ? "⏳ Отправка..." : "📅 Записаться"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Уведомление об успехе */}
      {isSuccess && currentService && selectedDateFromCalendar && selectedAppointment && (
        <NotificationWindow
          serviceTitle={currentService.title}
          servicePrice={currentService.price}
          appointmentDate={selectedDateFromCalendar}
          appointmentTime={selectedAppointment.time}
          appointmentMaster={selectedMaster?.name}
          onClose={handleCloseNotification}
        />
      )}
    </div>
  );
}