"use client";
import { useState, useEffect } from "react";
import { masters } from "@/app/data/services/masters.data";
import { services } from "@/app/data/services/services.data";
import { masterServices } from "@/app/data/services/masterService.data";
import { masterSchedule, WeekSchedule } from "@/app/data/services/masterSchedule.data";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  time: string;
  price: string;
  master: string;
  status: string;
  date: string;
}

interface NewAppointmentsWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (appointment: Omit<Appointment, "id" | "status">) => void;
}

// Тип для ключей дней недели
type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export default function NewAppointmentsWindow({
  isOpen,
  onClose,
  onSave
}: NewAppointmentsWindowProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    time: "",
    price: "",
    master: "",
    date: ""
  });

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availableServices, setAvailableServices] = useState(services);

  // Функция для получения дня недели
  const getDayOfWeek = (date: Date): DayOfWeek => {
    const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[date.getDay()];
  };

  // Обновляем доступные услуги при выборе мастера
  useEffect(() => {
    if (formData.master) {
      const selectedMasterId = parseInt(formData.master);
      const masterService = masterServices.find(ms => ms.masterId === selectedMasterId);
      
      if (masterService) {
        const filteredServices = services.filter(service => 
          masterService.serviceIds.includes(service.id)
        );
        setAvailableServices(filteredServices);
      } else {
        setAvailableServices([]);
      }
      
      // Сбрасываем выбранную услугу при смене мастера
      setFormData(prev => ({ ...prev, service: "", price: "" }));
    } else {
      setAvailableServices(services);
    }
  }, [formData.master]);

  // Обновляем доступное время при выборе мастера и даты
  useEffect(() => {
    if (formData.master && formData.date) {
      const selectedMasterId = parseInt(formData.master);
      const selectedDate = new Date(formData.date);
      const dayOfWeek: DayOfWeek = getDayOfWeek(selectedDate);
      
      const masterSched = masterSchedule.find(ms => ms.masterId === selectedMasterId);
      
      if (masterSched && masterSched.schedule[dayOfWeek]) {
        const daySchedule = masterSched.schedule[dayOfWeek];
        if (daySchedule) {
          const times = daySchedule.appointments.map((appointment: { time: string }) => appointment.time);
          setAvailableTimes(times);
        } else {
          setAvailableTimes([]);
        }
      } else {
        setAvailableTimes([]);
      }
      
      // Сбрасываем выбранное время при смене мастера или даты
      setFormData(prev => ({ ...prev, time: "" }));
    } else {
      setAvailableTimes([]);
    }
  }, [formData.master, formData.date]);

  // Обновляем цену при выборе услуги
  useEffect(() => {
    if (formData.service) {
      const selectedService = services.find(service => service.id === parseInt(formData.service));
      if (selectedService) {
        setFormData(prev => ({ 
          ...prev, 
          price: `${selectedService.price} ₽` 
        }));
      }
    }
  }, [formData.service]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'clientPhone') {
      // Форматируем номер телефона
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      // Получаем название услуги для сохранения
      const selectedService = services.find(service => service.id === parseInt(formData.service));
      const serviceName = selectedService ? selectedService.title : formData.service;
      
      // Получаем имя мастера для сохранения
      const selectedMaster = masters.find(master => master.id === parseInt(formData.master));
      const masterName = selectedMaster ? selectedMaster.name : formData.master;

      onSave({
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        service: serviceName,
        time: formData.time,
        price: formData.price,
        master: masterName,
        date: formData.date
      });
    }
    // Закрываем окно после сохранения
    onClose();
    // Сбрасываем форму
    setFormData({
      clientName: "",
      clientPhone: "",
      service: "",
      time: "",
      price: "",
      master: "",
      date: ""
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 text-black bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        {/* Заголовок */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Новая запись
          </h2>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Имя клиента */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя клиента *
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите имя клиента"
            />
          </div>

          {/* Телефон клиента */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон клиента *
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+7 (___) ___-__-__"
              maxLength={18} // Максимальная длина форматированного номера
            />
          </div>

          {/* Мастер */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Мастер *
            </label>
            <select
              name="master"
              value={formData.master}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Выберите мастера</option>
              {masters.map(master => (
                <option key={master.id} value={master.id}>
                  {master.name}
                </option>
              ))}
            </select>
          </div>

          {/* Услуга */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Услуга *
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleInputChange}
              required
              disabled={!formData.master}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{formData.master ? "Выберите услугу" : "Сначала выберите мастера"}</option>
              {availableServices.map(service => (
                <option key={service.id} value={service.id}>
                  {service.title} ({service.duration} мин) - {service.price} ₽
                </option>
              ))}
            </select>
          </div>

          {/* Дата */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Время */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Время *
            </label>
            <select
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
              disabled={!formData.master || !formData.date || availableTimes.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!formData.master || !formData.date 
                  ? "Сначала выберите мастера и дату" 
                  : availableTimes.length === 0 
                    ? "Нет доступного времени" 
                    : "Выберите время"}
              </option>
              {availableTimes.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Стоимость */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Стоимость *
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              placeholder="Цена будет автоматически заполнена"
            />
            <p className="text-xs text-gray-500 mt-1">
              Цена автоматически устанавливается при выборе услуги
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white border bg-red-500 border-gray-300 hover:bg-red-600 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!formData.clientName || !formData.clientPhone || !formData.service || !formData.master || !formData.date || !formData.time}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Создать запись
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}