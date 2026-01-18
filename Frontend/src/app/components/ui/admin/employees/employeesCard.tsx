"use client";
import { useState, useRef } from "react";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";

interface MasterFormData {
  name: string;
  surname: string;
  middlename: string;
  phone: string;
  specialization: string;
  photo?: string;
  isActive?: boolean;
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setFormData({
      surname: "",
      name: "",
      middlename: "",
      phone: "",
      specialization: "",
    });
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.surname.trim() || !formData.middlename.trim()) {
      alert("Пожалуйста, заполните обязательные поля");
      return;
    }

    setIsLoading(true);

    try {
      const masterData: MasterFormData = {
        surname: formData.surname,
        name: formData.name,
        middlename: formData.middlename,
        phone: formData.phone.replace(/\D/g, ""),
        specialization: formData.specialization,
        photo: avatarPreview || undefined,
        isActive: true,
      };

      if (onSubmit) {
        await onSubmit(masterData);
      } else {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-black bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Создание мастера</h2>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={createMaster} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Аватар */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-medium"
              >
                {avatarPreview ? "Изменить фото" : "Загрузить фото"}
              </label>

              <p className="text-xs text-gray-500 text-center">
                Рекомендуемый размер: 300x300px<br />Макс. размер: 5MB
              </p>
            </div>

            {/* Поля мастера */}
            <div className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Фамилия *</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Отчество *</label>
                <input
                  type="text"
                  name="middlename"
                  value={formData.middlename}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Специализация</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="Парикмахер, массажист..."
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="px-6 py-3 bg-gray-100 rounded-xl"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl"
            >
              {isLoading ? "Создание..." : "Создать мастера"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
