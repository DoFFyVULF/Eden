"use client";
import { useState, useEffect, useRef } from "react";

// Импортируем ваши данные
import {
  category,
  services as allServices,
} from "@/app/data/services/services.data";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";

interface Category {
  id: number;
  title: string;
}

interface Service {
  id: number;
  title: string;
  duration: number;
  price: number;
  img: string;
  categoryId: number;
}

interface MasterService {
  serviceId: number;
  price: number;
  duration: number;
  originalPrice: number;
  originalDuration: number;
}

interface MasterFormData {
  name: string;
  surname: string;
  middlename: string;
  phone: string;
  specialization: string;
  photo?: string;
  isActive?: boolean;
  services?: MasterService[];
}

interface EmployeesCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (masterData: MasterFormData) => Promise<void>;
}

export default function EmployeesCard({
  isOpen,
  onClose,
  onSubmit,
}: EmployeesCardProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedServices, setSelectedServices] = useState<MasterService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    surname: "",
    name: "",
    middlename: "",
    phone: "",
    specialization: "",
  });

  const [serviceForm, setServiceForm] = useState({
    serviceId: 0,
    price: 0,
    duration: 0,
  });

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      const formattedCategories = category.map((cat) => ({
        id: cat.id,
        title: cat.title,
      }));

      const formattedServices: Service[] = allServices.map((service) => ({
        id: service.id,
        title: service.title,
        duration: service.duration,
        price: service.price,
        img: service.img,
        categoryId: service.categoryId as number,
      }));

      setCategories(formattedCategories);
      setServices(formattedServices);
      setIsLoading(false);
    }, 500);
  };

  const categoryServices =
    selectedCategory > 0
      ? services.filter((service) => service.categoryId === selectedCategory)
      : [];

  // Обработка изменений в основной форме
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Обработка загрузки аватара
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Размер файла не должен превышать 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Пожалуйста, выберите изображение");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление аватара
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Обработка изменений в форме услуги
  const handleServiceInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: name === "serviceId" ? parseInt(value) : parseFloat(value) || 0,
    }));
  };

  // Когда выбирается услуга, автоматически подставляем цену и время
  useEffect(() => {
    if (serviceForm.serviceId > 0) {
      const selectedService = services.find(
        (s) => s.id === serviceForm.serviceId
      );
      if (selectedService) {
        setServiceForm((prev) => ({
          ...prev,
          price: selectedService.price,
          duration: selectedService.duration,
        }));
      }
    }
  }, [serviceForm.serviceId, services]);

  // Добавление услуги мастеру
  const addServiceToMaster = () => {
    if (
      serviceForm.serviceId === 0 ||
      serviceForm.price <= 0 ||
      serviceForm.duration <= 0
    ) {
      alert("Пожалуйста, заполните все поля услуги");
      return;
    }

    const service = services.find((s) => s.id === serviceForm.serviceId);
    if (!service) return;

    if (selectedServices.some((s) => s.serviceId === serviceForm.serviceId)) {
      alert("Эта услуга уже добавлена");
      return;
    }

    const newService: MasterService = {
      serviceId: serviceForm.serviceId,
      price: serviceForm.price,
      duration: serviceForm.duration,
      originalPrice: service.price,
      originalDuration: service.duration,
    };

    setSelectedServices((prev) => [...prev, newService]);

    setServiceForm({
      serviceId: 0,
      price: 0,
      duration: 0,
    });
  };

  // Удаление услуги из списка
  const removeService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.filter((s) => s.serviceId !== serviceId)
    );
  };

  // Создание мастера
  const createMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.surname.trim() ||
      !formData.middlename.trim() ||
      selectedServices.length === 0
    ) {
      alert(
        "Пожалуйста, заполните основные данные и добавьте хотя бы одну услугу"
      );
      return;
    }

    setIsLoading(true);

    try {
      const masterData: MasterFormData = {
        surname: formData.surname,
        name: formData.name,
        middlename: formData.middlename,
        phone: formData.phone.replace(/\D/g, ""), // Очищаем телефон от форматирования
        specialization: formData.specialization,
        photo: avatarPreview || undefined,
        isActive: true,
        services: selectedServices,
      };

      if (onSubmit) {
        await onSubmit(masterData);
      } else {
        // Fallback если onSubmit не передан
        setTimeout(() => {
          resetForm();
          onClose();
          alert("Мастер успешно создан!");
        }, 1000);
      }
    } catch (error) {
      console.error("Ошибка при создании мастера:", error);
      alert("Произошла ошибка при создании мастера");
    } finally {
      setIsLoading(false);
    }
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      surname: "",
      name: "",
      middlename: "",
      phone: "",
      specialization: "",
    });
    setSelectedServices([]);
    setSelectedCategory(0);
    setServiceForm({
      serviceId: 0,
      price: 0,
      duration: 0,
    });
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Получение названия услуги по ID
  const getServiceName = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    return service?.title || "Неизвестная услуга";
  };

  // Получение названия категории по ID услуги
  const getCategoryName = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    const category = categories.find((c) => c.id === service?.categoryId);
    return category?.title || "";
  };

  // Проверка, отличается ли цена от стандартной
  const isPriceChanged = (service: MasterService) => {
    return service.price !== service.originalPrice;
  };

  // Проверка, отличается ли длительность от стандартной
  const isDurationChanged = (service: MasterService) => {
    return service.duration !== service.originalDuration;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-black bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Создание мастера
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={createMaster} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Основная информация */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Основная информация
              </h3>

              {/* Аватар */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Аватар мастера"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium"
                  >
                    {avatarPreview ? "Изменить фото" : "Загрузить фото"}
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Рекомендуемый размер: 300x300px
                  <br />
                  Макс. размер: 5MB
                </p>
              </div>

              <div>
                <label
                  htmlFor="surname"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Фамилия *
                </label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder="Введите фамилию"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Введите имя"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="middlename"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Отчество *
                </label>
                <input
                  type="text"
                  id="middlename"
                  name="middlename"
                  value={formData.middlename}
                  onChange={handleInputChange}
                  placeholder="Введите отчество"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Телефон
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="specialization"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Специализация
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="Например: Парикмахер, Массажист"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Создание..." : "Создать мастера"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
