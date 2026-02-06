"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  X, 
  User, 
  Phone, 
  Scissors, 
  Camera, 
  Upload, 
  Trash2,
  Sparkles,
  Shield,
  UserPlus,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  Edit
} from "lucide-react";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";
import { IMaster } from '@/types/masters.type';

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
  master?: IMaster; // Для режима редактирования
  isEditMode?: boolean; // Флаг режима редактирования
}

const slideIn: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: { opacity: 0, y: 30, scale: 0.95 }
};

const overlayAnimation: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function EmployeesCard({
  isOpen,
  onClose,
  onSubmit,
  master,
  isEditMode = false,
}: EmployeesCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    surname: "",
    name: "",
    middlename: "",
    phone: "",
    specialization: "",
  });

  // Инициализация формы при редактировании
  useEffect(() => {
    if (isEditMode && master) {
      setFormData({
        surname: master.surname,
        name: master.name,
        middlename: master.middlename || "",
        phone: master.phone ? formatPhoneNumber(master.phone) : "",
        specialization: master.specialization,
      });
      setAvatarPreview(master.photo || null);
    } else {
      // Сброс формы при создании
      setFormData({
        surname: "",
        name: "",
        middlename: "",
        phone: "",
        specialization: "",
      });
      setAvatarPreview(null);
      setIsDragging(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [master, isEditMode, isOpen]);

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
    processImageFile(file);
  };

  const processImageFile = (file: File | undefined) => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    processImageFile(file);
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
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        isActive: isEditMode ? master?.isActive : true,
      };

      if (onSubmit) {
        await onSubmit(masterData);
      } else {
        setTimeout(() => {
          resetForm();
          onClose();
          alert(isEditMode ? "Мастер успешно обновлен!" : "Мастер успешно создан!");
        }, 1000);
      }
    } catch (error) {
      console.error(`Ошибка при ${isEditMode ? 'обновлении' : 'создании'} мастера:`, error);
      alert(`Произошла ошибка при ${isEditMode ? 'обновлении' : 'создании'} мастера`);
    } finally {
      setIsLoading(false);
    }
  };

  const modalTitle = isEditMode ? "Редактирование сотрудника" : "Создание сотрудника";
  const modalDescription = isEditMode 
    ? "Измените информацию о сотруднике" 
    : "Заполните информацию о новом сотруднике";
  const submitButtonText = isEditMode ? "Сохранить изменения" : "Создать сотрудника";
  const gradientFrom = isEditMode ? "from-emerald-600" : "from-blue-600";
  const gradientVia = isEditMode ? "via-green-600" : "via-indigo-600";
  const gradientTo = isEditMode ? "to-teal-600" : "to-purple-600";
  const iconColor = isEditMode ? "text-emerald-500" : "text-blue-500";
  const icon = isEditMode ? <Edit className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />;
  const buttonIcon = isEditMode ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Градиентный заголовок */}
              <div className={`relative px-6 py-5 bg-gradient-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}>
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Sparkles className="w-12 h-12" />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      {icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
                      <p className="text-white/80 text-xs mt-1">
                        {modalDescription}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { resetForm(); onClose(); }}
                    className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Основной контент с прокруткой */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Левая колонка - фото */}
                    <div className="space-y-6">
                      {/* Загрузка аватара */}
                      <div className="bg-gradient-to-br from-gray-50 to-white/50 rounded-xl p-5 border border-gray-200/50">
                        <div className={`text-base font-semibold text-gray-900 mb-4 flex items-center gap-2`}>
                          <Camera className={`w-4 h-4 ${iconColor}`} />
                          Фотография профиля
                        </div>
                        
                        <div
                          ref={dropZoneRef}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                            isDragging 
                              ? `${isEditMode ? 'border-emerald-500' : 'border-blue-500'} ${isEditMode ? 'bg-emerald-50/50' : 'bg-blue-50/50'}` 
                              : 'border-gray-300/50 hover:border-gray-400/50'
                          }`}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                            id="avatar-upload"
                          />
                          
                          {avatarPreview ? (
                            <div className="p-4">
                              <div className="relative">
                                <img 
                                  src={avatarPreview} 
                                  alt="Preview" 
                                  className="w-full h-40 rounded-xl object-cover shadow-lg"
                                />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={handleRemoveAvatar}
                                  className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-full p-1.5 hover:shadow-lg transition-all duration-300 shadow-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
                              <div className="flex justify-center mt-4">
                                <label
                                  htmlFor="avatar-upload"
                                  className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${isEditMode ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-purple-500'} text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer text-sm font-medium`}
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  Заменить фото
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label
                              htmlFor="avatar-upload"
                              className="flex flex-col items-center justify-center p-6 cursor-pointer"
                            >
                              <div className={`w-16 h-16 bg-gradient-to-br ${isEditMode ? 'from-emerald-500/10 to-teal-500/10' : 'from-blue-500/10 to-purple-500/10'} rounded-xl flex items-center justify-center mb-3`}>
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Нажмите или перетащите фото
                                </p>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, GIF до 5MB
                                </p>
                                <div className="mt-3">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${isEditMode ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-purple-500'} text-white rounded-lg text-sm font-medium`}>
                                    <Upload className="w-3.5 h-3.5" />
                                    Выбрать файл
                                  </span>
                                </div>
                              </div>
                            </label>
                          )}
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span>300×300px</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className={`w-3 h-3 ${iconColor}`} />
                            <span>Безопасно</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Правая колонка - форма */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <User className={`w-3.5 h-3.5 ${iconColor}`} />
                            Фамилия *
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              name="surname"
                              value={formData.surname}
                              onChange={handleInputChange}
                              className={`w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 ${isEditMode ? 'focus:ring-emerald-500/30 focus:border-emerald-500' : 'focus:ring-blue-500/30 focus:border-blue-500'} text-gray-900 placeholder-gray-500 transition-all duration-300`}
                              placeholder="Иванов"
                              required
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <User className={`w-3.5 h-3.5 ${iconColor}`} />
                            Имя *
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className={`w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 ${isEditMode ? 'focus:ring-emerald-500/30 focus:border-emerald-500' : 'focus:ring-blue-500/30 focus:border-blue-500'} text-gray-900 placeholder-gray-500 transition-all duration-300`}
                              placeholder="Иван"
                              required
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <User className={`w-3.5 h-3.5 ${iconColor}`} />
                            Отчество *
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              name="middlename"
                              value={formData.middlename}
                              onChange={handleInputChange}
                              className={`w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 ${isEditMode ? 'focus:ring-emerald-500/30 focus:border-emerald-500' : 'focus:ring-blue-500/30 focus:border-blue-500'} text-gray-900 placeholder-gray-500 transition-all duration-300`}
                              placeholder="Иванович"
                              required
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Phone className={`w-3.5 h-3.5 ${iconColor}`} />
                            Телефон
                          </div>
                          <div className="relative">
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+7 (999) 999-99-99"
                              className={`w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 ${isEditMode ? 'focus:ring-emerald-500/30 focus:border-emerald-500' : 'focus:ring-blue-500/30 focus:border-blue-500'} text-gray-900 placeholder-gray-500 transition-all duration-300`}
                            />
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-full">
                        <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Scissors className={`w-3.5 h-3.5 ${iconColor}`} />
                          Специализация
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
                            placeholder="Парикмахер, массажист, косметолог..."
                            className={`w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 ${isEditMode ? 'focus:ring-emerald-500/30 focus:border-emerald-500' : 'focus:ring-blue-500/30 focus:border-blue-500'} text-gray-900 placeholder-gray-500 transition-all duration-300`}
                          />
                          <Scissors className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {["Парикмахер", "Массажист", "Косметолог", "Маникюр", "Визажист", "Стилист"].map((spec) => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, specialization: spec }))}
                              className={`px-3 py-1 text-xs rounded-lg transition-all duration-300 ${
                                formData.specialization === spec
                                  ? `${isEditMode ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white shadow-md`
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Дополнительная информация для режима редактирования */}
                  {isEditMode && master && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-gradient-to-r from-gray-50/50 to-white/30 border border-gray-200/30 rounded-xl backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Текущий статус</p>
                          <p className={`px-3 py-1 inline-block rounded-full font-medium text-sm ${
                            master.isActive 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {master.isActive ? 'Активен' : 'Неактивен'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">ID сотрудника</p>
                          <p className="font-mono text-gray-900">{master.id}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Сводная информация */}
                  {formData.name && formData.surname && formData.middlename && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-4 bg-gradient-to-r ${isEditMode ? 'from-emerald-50/50 to-teal-50/50 border-emerald-200/30' : 'from-blue-50/50 to-indigo-50/50 border-blue-200/30'} border rounded-xl backdrop-blur-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Сводная информация</p>
                          <p className="font-medium text-gray-900 text-sm">
                            {formData.surname} {formData.name} {formData.middlename}
                          </p>
                          {formData.specialization && (
                            <p className="text-xs text-gray-600 mt-1">
                              Специализация: {formData.specialization}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Статус</p>
                          <p className={`font-bold ${isEditMode ? 'text-emerald-600' : 'text-blue-600'} text-sm`}>
                            {isEditMode && master ? (master.isActive ? 'Активный' : 'Неактивный') : 'Активный'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Кнопки */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-200/50">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { resetForm(); onClose(); }}
                      className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-semibold hover:bg-gray-50/80 transition-all duration-300 shadow-sm text-sm"
                    >
                      Отмена
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                      className={`flex-1 px-4 py-3 bg-gradient-to-r ${gradientFrom} ${gradientVia} ${gradientTo} text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isEditMode ? 'Сохранение...' : 'Создание...'}
                        </>
                      ) : (
                        <>
                          {buttonIcon}
                          {submitButtonText}
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* Футер */}
              <div className="px-6 py-3 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/30">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-2.5 h-2.5" />
                    <span>Данные защищены</span>
                  </div>
                  <span>ID: {isEditMode && master ? master.id : 'Новый'}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}