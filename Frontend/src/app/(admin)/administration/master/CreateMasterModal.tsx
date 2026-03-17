"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Phone,
  Scissors,
  Camera,
  Upload,
  Trash2,
  UserPlus,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  Edit,
  Shield,
} from "lucide-react";
import { formatPhoneNumber } from "@/app/lib/formatPhoneNumber";
import { IMaster } from "@/types/masters.type";

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
  onSubmit?: (data: MasterFormData) => Promise<void>;
  master?: IMaster;
  isEditMode?: boolean;
}

const SPECIALIZATIONS = [
  "Парикмахер",
  "Массажист",
  "Косметолог",
  "Маникюр",
  "Визажист",
  "Стилист",
];

const SPEC_GRAD: Record<string, string> = {
  парикмахер: "from-blue-500 to-cyan-500",
  массажист: "from-emerald-500 to-green-500",
  косметолог: "from-purple-500 to-pink-500",
  маникюр: "from-amber-500 to-orange-500",
  визажист: "from-rose-500 to-red-500",
  стилист: "from-indigo-500 to-blue-500",
};
const specGrad = (s: string) =>
  SPEC_GRAD[s.toLowerCase()] ?? "from-slate-500 to-gray-600";

// Named export — основной
export function EmployeesCard({
  isOpen,
  onClose,
  onSubmit,
  master,
  isEditMode = false,
}: EmployeesCardProps) {
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    surname: "",
    name: "",
    middlename: "",
    phone: "",
    specialization: "",
  });

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (isEditMode && master) {
      setForm({
        surname: master.surname,
        name: master.name,
        middlename: master.middlename || "",
        phone: master.phone ? formatPhoneNumber(master.phone) : "",
        specialization: master.specialization,
      });
      setAvatarPreview(master.photo || null);
    } else {
      setForm({
        surname: "",
        name: "",
        middlename: "",
        phone: "",
        specialization: "",
      });
      setAvatarPreview(null);
    }
  }, [master, isEditMode, isOpen]);

  const processImage = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Файл не должен превышать 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Выберите изображение");
      return;
    }
    const r = new FileReader();
    r.onload = (e) => setAvatarPreview(e.target?.result as string);
    r.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "phone" ? formatPhoneNumber(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.surname.trim()) {
      alert("Заполните обязательные поля");
      return;
    }
    setLoading(true);
    try {
      await onSubmit?.({
        ...form,
        phone: form.phone.replace(/\D/g, ""),
        photo: avatarPreview || undefined,
        isActive: isEditMode ? master?.isActive : true,
      });
    } catch (err) {
      console.error(err);
      alert("Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setForm({
      surname: "",
      name: "",
      middlename: "",
      phone: "",
      specialization: "",
    });
    setAvatarPreview(null);
    onClose();
  };

  const grad = isEditMode
    ? "from-emerald-500 via-teal-500 to-cyan-500"
    : "from-blue-500 via-indigo-500 to-purple-500";

  const ringDark = isEditMode
    ? "focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20"
    : "focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/20";

  const ringLight = isEditMode
    ? "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10"
    : "focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10";

  const modalCls = isDark
    ? "bg-slate-900/88 backdrop-blur-3xl border border-white/[0.1] shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
    : "bg-white/96 backdrop-blur-xl border border-gray-200/70 shadow-2xl";

  const inputCls = `w-full h-11 pl-10 pr-4 rounded-xl text-sm border outline-none transition-all ${
    isDark
      ? `bg-white/[0.07] border-white/[0.09] text-white/90 placeholder-white/25 ${ringDark}`
      : `bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 ${ringLight}`
  }`;

  const currentGrad = specGrad(form.specialization);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && close()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{
            background: isDark ? "rgba(0,0,0,0.78)" : "rgba(15,23,42,0.42)",
            backdropFilter: "blur(16px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-2xl rounded-3xl overflow-hidden my-4 flex flex-col max-h-[90vh] ${modalCls}`}
          >
            {/* HEADER */}
            <div
              className={`relative px-7 py-6 bg-gradient-to-r ${grad} overflow-hidden flex-shrink-0`}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white/15" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    {isEditMode ? (
                      <Edit size={20} className="text-white" />
                    ) : (
                      <UserPlus size={20} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {isEditMode
                        ? "Редактировать сотрудника"
                        : "Новый сотрудник"}
                    </h2>
                    <p className="text-white/65 text-xs mt-0.5">
                      {isEditMode ? "Изменение данных" : "Заполните информацию"}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  onClick={close}
                  className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
                >
                  <X size={17} />
                </motion.button>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 lg:p-7">
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
                  {/* LEFT: AVATAR */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <p
                        className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                          isDark ? "text-white/35" : "text-gray-400"
                        }`}
                      >
                        <Camera size={12} />
                        Фото
                      </p>

                      {avatarPreview ? (
                        <div className="relative">
                          <img
                            src={avatarPreview}
                            alt="preview"
                            className="w-full h-44 lg:h-36 object-cover rounded-2xl shadow-lg"
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent rounded-b-2xl" />
                          <button
                            type="button"
                            onClick={() => setAvatarPreview(null)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                          <label
                            htmlFor="avatar-input"
                            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-semibold cursor-pointer hover:bg-white/30 transition-colors whitespace-nowrap"
                          >
                            <Upload size={11} />
                            Заменить
                          </label>
                        </div>
                      ) : (
                        <label
                          htmlFor="avatar-input"
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                          }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            processImage(e.dataTransfer.files?.[0]);
                          }}
                          className={`flex flex-col items-center justify-center h-44 lg:h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                            dragging
                              ? isDark
                                ? "border-indigo-400/60 bg-indigo-500/10"
                                : "border-blue-400 bg-blue-50"
                              : isDark
                                ? "border-white/[0.1] hover:border-white/[0.18] hover:bg-white/[0.04]"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 ${
                              isDark ? "bg-white/[0.07]" : "bg-gray-100"
                            }`}
                          >
                            <ImageIcon
                              size={22}
                              className={
                                isDark ? "text-white/25" : "text-gray-300"
                              }
                            />
                          </div>
                          <p
                            className={`text-xs font-semibold mb-1 ${isDark ? "text-white/50" : "text-gray-500"}`}
                          >
                            Фото профиля
                          </p>
                          <p
                            className={`text-[11px] ${isDark ? "text-white/25" : "text-gray-400"}`}
                          >
                            до 5 МБ
                          </p>
                          <div
                            className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${grad} shadow-sm`}
                          >
                            <Upload size={11} />
                            Выбрать
                          </div>
                        </label>
                      )}
                      <input
                        type="file"
                        id="avatar-input"
                        ref={fileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => processImage(e.target.files?.[0])}
                      />
                    </div>

                    {/* Specialization preview */}
                    {form.specialization && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-2xl p-4 border ${
                          isDark
                            ? "bg-white/[0.05] border-white/[0.07]"
                            : "bg-gray-50 border-gray-200/60"
                        }`}
                      >
                        <p
                          className={`text-xs mb-2 ${isDark ? "text-white/30" : "text-gray-400"}`}
                        >
                          Специализация
                        </p>
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${currentGrad} shadow-sm`}
                        >
                          <Scissors size={11} />
                          {form.specialization}
                        </div>
                      </motion.div>
                    )}

                    {/* Status (edit mode) */}
                    {isEditMode && master && (
                      <div
                        className={`rounded-2xl p-4 border ${
                          isDark
                            ? "bg-white/[0.05] border-white/[0.07]"
                            : "bg-gray-50 border-gray-200/60"
                        }`}
                      >
                        <p
                          className={`text-xs mb-2 ${isDark ? "text-white/30" : "text-gray-400"}`}
                        >
                          Статус · ID {master.id}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            master.isActive
                              ? isDark
                                ? "bg-emerald-500/10 border-emerald-400/15 text-emerald-400"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : isDark
                                ? "bg-rose-500/10 border-rose-400/15 text-rose-400"
                                : "bg-rose-50 border-rose-200 text-rose-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${master.isActive ? "bg-emerald-400" : "bg-rose-400"}`}
                          />
                          {master.isActive ? "Активен" : "Неактивен"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: FIELDS */}
                  <div className="space-y-4">
                    {/* Surname + Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          name: "surname",
                          label: "Фамилия",
                          ph: "Иванов",
                          req: true,
                        },
                        { name: "name", label: "Имя", ph: "Иван", req: true },
                      ].map((f) => (
                        <div key={f.name}>
                          <label
                            className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                              isDark ? "text-white/35" : "text-gray-400"
                            }`}
                          >
                            {f.label} {f.req && "*"}
                          </label>
                          <div className="relative">
                            <User
                              size={14}
                              className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                                isDark ? "text-white/25" : "text-gray-400"
                              }`}
                            />
                            <input
                              type="text"
                              name={f.name}
                              value={(form as any)[f.name]}
                              onChange={handleChange}
                              placeholder={f.ph}
                              required={f.req}
                              className={inputCls}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Middlename */}
                    <div>
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                          isDark ? "text-white/35" : "text-gray-400"
                        }`}
                      >
                        Отчество
                      </label>
                      <div className="relative">
                        <User
                          size={14}
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                            isDark ? "text-white/25" : "text-gray-400"
                          }`}
                        />
                        <input
                          type="text"
                          name="middlename"
                          value={form.middlename}
                          onChange={handleChange}
                          placeholder="Иванович"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                          isDark ? "text-white/35" : "text-gray-400"
                        }`}
                      >
                        Телефон
                      </label>
                      <div className="relative">
                        <Phone
                          size={14}
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                            isDark ? "text-white/25" : "text-gray-400"
                          }`}
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+7 (999) 999-99-99"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Specialization */}
                    <div>
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                          isDark ? "text-white/35" : "text-gray-400"
                        }`}
                      >
                        Специализация
                      </label>
                      <div className="relative">
                        <Scissors
                          size={14}
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                            isDark ? "text-white/25" : "text-gray-400"
                          }`}
                        />
                        <input
                          type="text"
                          name="specialization"
                          value={form.specialization}
                          onChange={handleChange}
                          placeholder="Парикмахер, массажист..."
                          className={inputCls}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {SPECIALIZATIONS.map((sp) => (
                          <motion.button
                            key={sp}
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() =>
                              setForm((p) => ({ ...p, specialization: sp }))
                            }
                            className={`h-7 px-3 rounded-full text-xs font-semibold transition-all ${
                              form.specialization === sp
                                ? `bg-gradient-to-r ${specGrad(sp)} text-white shadow-md`
                                : isDark
                                  ? "bg-white/[0.06] border border-white/[0.08] text-white/45 hover:bg-white/[0.1]"
                                  : "bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {sp}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <AnimatePresence>
                      {(form.name || form.surname) && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                            isDark
                              ? "bg-white/[0.05] border-white/[0.07]"
                              : "bg-gray-50/80 border-gray-200/60"
                          }`}
                        >
                          <div>
                            <p
                              className={`text-xs mb-0.5 ${isDark ? "text-white/30" : "text-gray-400"}`}
                            >
                              Сводка
                            </p>
                            <p
                              className={`text-sm font-bold ${isDark ? "text-white/85" : "text-gray-800"}`}
                            >
                              {[form.surname, form.name, form.middlename]
                                .filter(Boolean)
                                .join(" ")}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isDark
                                ? "bg-emerald-500/10 border-emerald-400/15 text-emerald-400"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            }`}
                          >
                            <CheckCircle size={11} />
                            {isEditMode
                              ? master?.isActive
                                ? "Активный"
                                : "Неактивный"
                              : "Новый"}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* BUTTONS */}
                <div
                  className={`flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t ${
                    isDark ? "border-white/[0.07]" : "border-gray-100"
                  }`}
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={close}
                    disabled={loading}
                    className={`flex-1 h-12 rounded-2xl text-sm font-semibold border transition-all ${
                      isDark
                        ? "bg-white/[0.06] border-white/[0.1] text-white/60 hover:bg-white/[0.09]"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    Отмена
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className={`flex-1 h-12 rounded-2xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 bg-gradient-to-r ${grad}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {isEditMode ? "Сохранение..." : "Создание..."}
                      </>
                    ) : isEditMode ? (
                      <>
                        <Edit size={16} />
                        Сохранить изменения
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Создать сотрудника
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* FOOTER */}
            <div
              className={`px-7 py-3 border-t flex items-center justify-between text-xs flex-shrink-0 ${
                isDark
                  ? "border-white/[0.06] text-white/20 bg-white/[0.02]"
                  : "border-gray-100 text-gray-400 bg-gray-50/50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Shield size={11} />
                Данные защищены
              </span>
              <span>ID: {isEditMode && master ? master.id : "Новый"}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EmployeesCard;
